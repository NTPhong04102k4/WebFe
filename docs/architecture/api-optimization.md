# API Optimization — SoldCars Backend

Checklist tối ưu API ASP.NET Core 8 cho dự án SoldCars. Mỗi mục có: (a) triệu chứng, (b) giải pháp, (c) code / config mẫu áp dụng trực tiếp vào `Program.cs` hoặc Service layer.

---

## 1. Response Compression (Brotli + Gzip)

**Triệu chứng:** JSON response >10KB, băng thông nghẽn, mobile client chậm.

**Giải pháp:**

```csharp
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json", "text/json"
    });
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);
builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);

// ... after builder.Build():
app.UseResponseCompression();
```

Đặt **trước** `UseCors`/`UseAuthentication`.

---

## 2. Output Caching + Redis Distributed Cache

**Triệu chứng:** Endpoint công khai (`GET /brand`, `GET /hr/skills`) bị query lặp lại mỗi giây.

**Giải pháp:**

```csharp
// Distributed cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
    options.InstanceName = "soldcars:";
});

// Output cache
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("Short", b => b.Expire(TimeSpan.FromSeconds(30)));
    options.AddPolicy("Long",  b => b.Expire(TimeSpan.FromMinutes(10)));
});

app.UseOutputCache();
```

Gắn attribute:

```csharp
[HttpGet]
[OutputCache(PolicyName = "Short")]
public async Task<IActionResult> GetAll() { ... }
```

**Cache-aside trong Service** (qua `IRedisService` đã có):

```csharp
public async Task<BrandViewModel?> GetByIdAsync(int id)
{
    var key = $"brand:{id}";
    var cached = await _redis.GetAsync<BrandViewModel>(key);
    if (cached != null) return cached;

    var vm = await _db.Brands.Where(b => b.BrandID == id)
        .Select(b => new BrandViewModel { /* projection */ })
        .AsNoTracking()
        .FirstOrDefaultAsync();

    if (vm != null) await _redis.SetAsync(key, vm, TimeSpan.FromMinutes(5));
    return vm;
}
```

**Invalidation:** sau `CreateAsync` / `UpdateAsync` / `DeleteAsync` → gọi `_redis.RemoveAsync("brand:{id}")` + `_redis.RemoveByPrefixAsync("brand:list:")`.

---

## 3. EF Core — Projection, AsNoTracking, Compiled Queries

### 3.1 Projection thay vì Include toàn entity

**Bad:**
```csharp
var car = await _db.Cars
    .Include(c => c.Brand).Include(c => c.BodyType).Include(c => c.Accessories)
    .FirstOrDefaultAsync(c => c.CarID == id);
return _mapper.Map<CarViewModel>(car);
```

**Good:**
```csharp
var vm = await _db.Cars
    .Where(c => c.CarID == id)
    .Select(c => new CarViewModel
    {
        CarID = c.CarID,
        BrandName = c.Brand.BrandName,
        BodyTypeName = c.BodyType.BodyTypeName,
        AccessoryCount = c.Accessories.Count
    })
    .AsNoTracking()
    .FirstOrDefaultAsync();
```

SQL ngắn hơn, ít memory, không track entity.

### 3.2 AsSplitQuery khi Include nhiều collection

```csharp
await _db.WorkOrders
    .Include(w => w.Services)
    .Include(w => w.Parts)
    .Include(w => w.CustomerVehicle)
    .AsSplitQuery()
    .FirstOrDefaultAsync(w => w.WorkOrderID == id);
```

Tránh Cartesian explosion.

### 3.3 Compiled Query cho hot path

```csharp
private static readonly Func<SoldCarsDbContext, int, Task<Car?>> _getCarById =
    EF.CompileAsyncQuery((SoldCarsDbContext db, int id) =>
        db.Cars.AsNoTracking().FirstOrDefault(c => c.CarID == id));

// Usage:
var car = await _getCarById(_db, id);
```

Bỏ qua EF query-plan caching overhead.

---

## 4. Pagination mặc định

**Vấn đề:** Client gọi `GET /work-orders` không pagination → load vài trăm ngàn record.

**Ràng buộc tại controller:**

```csharp
public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
{
    page = Math.Max(page, 1);
    pageSize = Math.Clamp(pageSize, 1, 100);
    // ...
}
```

Hoặc tạo `PagedQuery` base class với validator.

---

## 5. Rate Limiting

**Triệu chứng:** Bị spam login, brute-force OTP.

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.AddTokenBucketLimiter("api", opt =>
    {
        opt.TokenLimit = 100;
        opt.TokensPerPeriod = 100;
        opt.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
    });
});

app.UseRateLimiter();
```

Gắn cho endpoint:
```csharp
[EnableRateLimiting("auth")]
[HttpPost("login")] ...
```

---

## 6. Connection Pooling + Retry

### 6.1 DbContext pool

```csharp
builder.Services.AddDbContextPool<SoldCarsDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql =>
        {
            sql.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
            sql.CommandTimeout(30);
        });
    options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
});
```

Pool size mặc định 1024 — giảm overhead create-dispose DbContext.

### 6.2 HttpClient pooling

Đã có `AddHttpClient("SePay", ...)`. Cấu hình thêm:

```csharp
builder.Services.AddHttpClient("SePay")
    .SetHandlerLifetime(TimeSpan.FromMinutes(5))
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(10),
        MaxConnectionsPerServer = 50,
    });
```

---

## 7. Async All The Way — không `.Result` / `.Wait()`

**Bad:**
```csharp
var count = _db.Cars.CountAsync().Result;  // deadlock risk
```

**Good:**
```csharp
var count = await _db.Cars.CountAsync();
```

Audit repo bằng `rg "\.Result|\.Wait\(\)" --type=cs`.

---

## 8. Minimize Middleware / Short-circuit public endpoints

Middleware `UseJwtBlacklist` đang gọi Redis cho **mỗi** request authenticated. Với endpoint public (Swagger, `/health`, `/brand`...) thì skip:

```csharp
app.UseWhen(
    ctx => !ctx.Request.Path.StartsWithSegments("/health")
        && !ctx.Request.Path.StartsWithSegments("/swagger"),
    branch => branch.UseJwtBlacklist());
```

---

## 9. JSON Serializer Options

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
```

Ignore null → response size ↓ 20-40% trên ViewModel nhiều field nullable.

---

## 10. HTTP/2, HTTP/3 (QUIC), Kestrel tuning

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxConcurrentConnections = 1000;
    options.Limits.MaxConcurrentUpgradedConnections = 1000;
    options.Limits.MaxRequestBodySize = 20 * 1024 * 1024; // 20MB
    options.Limits.MinRequestBodyDataRate = null;  // slow-upload clients
});
```

Cloud Run tự bật HTTP/2. Với HTTP/3 cần Cloud Load Balancer + L7 proxy có hỗ trợ QUIC.

---

## 11. Database Indexing

Đã index trong `SoldCarsDbContext.OnModelCreating` cho:
- Unique: `PolicyNumber`, `WorkOrderNumber`, `AppointmentNumber`, `SkillCode`, `LevelCode`, `ClaimNumber`, `LicensePlate`, `VIN`
- Non-unique: `Status`, `UserID`, `LocationID`, `IsActive`

**Kiểm tra missing index bằng SQL:**
```sql
SELECT TOP 10
    mig.index_handle, dbid, object_id,
    migs.avg_user_impact, migs.avg_total_user_cost,
    mid.equality_columns, mid.inequality_columns, mid.included_columns
FROM sys.dm_db_missing_index_group_stats migs
JOIN sys.dm_db_missing_index_groups mig ON migs.group_handle = mig.index_group_handle
JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
ORDER BY migs.avg_user_impact DESC;
```

Run sau 1–2 tuần có traffic thật để biết composite index cần thêm.

---

## 12. Background Jobs (thay cho sync operation trong request)

Gửi email, upload file ảnh lớn, tính Payroll batch → không làm trong request. Dùng:
- **IHostedService** (hosted background)
- **Hangfire** (cron + queue persist)
- **Google Cloud Tasks / Pub/Sub** (đã có credential)

Ví dụ Payroll batch:

```csharp
public class PayrollBatchRunner : BackgroundService
{
    private readonly IServiceProvider _sp;
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _sp.CreateScope();
            var payroll = scope.ServiceProvider.GetRequiredService<IPayrollServices>();
            // ... run monthly at 1st day 00:05
            await Task.Delay(TimeSpan.FromHours(1), ct);
        }
    }
}
```

---

## 13. Monitoring & Observability

- **Logging**: Serilog + Application Insights / Cloud Logging
- **Metrics**: `builder.Services.AddMetrics()` + OpenTelemetry exporter
- **Tracing**: W3C Trace-Context, `Activity` trong endpoints quan trọng
- **Health**: `AddHealthChecks().AddSqlServer().AddRedis()` → `/health`

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<SoldCarsDbContext>()
    .AddRedis(builder.Configuration["Redis:ConnectionString"]!);

app.MapHealthChecks("/health");
```

---

## 14. Thứ tự middleware chuẩn

```
UseForwardedHeaders
  ↓
UseResponseCompression     ← thêm
  ↓
UseHttpsRedirection
  ↓
UseStaticFiles (nếu có)
  ↓
UseRouting                 ← implicit
  ↓
UseRateLimiter             ← thêm
  ↓
UseCors
  ↓
UseAuthentication
  ↓
UseJwtBlacklist
  ↓
UseAuthorization
  ↓
UseOutputCache             ← thêm (sau auth để cache theo user)
  ↓
MapControllers
```

---

## 15. Tổng hợp — Quick Win (áp dụng ngay)

1. ✅ `AddResponseCompression` (Brotli + Gzip)
2. ✅ `AddOutputCache` cho endpoint public (Brand, Skill, TechnicianLevel, InsuranceCompany)
3. ✅ Chuyển `AddDbContext` → `AddDbContextPool`
4. ✅ Bổ sung `.AsNoTracking()` + projection cho mọi Service read method
5. ✅ `AddRateLimiter` cho `/auth/login`, `/auth/otp`
6. ✅ `JsonIgnoreCondition.WhenWritingNull`
7. ✅ Clamp `pageSize ≤ 100` ở Controller
8. ✅ Health checks (`/health`) cho Load Balancer

Chi tiết áp dụng cho từng endpoint — xem tài liệu [url-flow.md](url-flow.md) để biết từng bước request đi qua đâu.

---

## 16. Tham khảo

- ASP.NET Core Performance best practices: <https://learn.microsoft.com/aspnet/core/performance/performance-best-practices>
- EF Core performance: <https://learn.microsoft.com/ef/core/performance/>
- Redis caching patterns: <https://redis.io/docs/latest/develop/use/patterns/>

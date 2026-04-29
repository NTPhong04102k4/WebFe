# URL Flow — What Happens When You Hit the API

Tài liệu mô tả luồng xử lý của một HTTP request tới API SoldCars từ lúc người dùng gõ URL cho đến lúc response trả về browser. Đây là nền tảng để hiểu các bước tối ưu ở `api-optimization.md`.

---

## 1. Tổng quan 10 bước

```
Browser  →  DNS  →  TCP/TLS  →  HTTP Request  →  CDN / Edge
                                                        │
                                                        ▼
                            Load Balancer (Cloud LB / Nginx / HAProxy)
                                                        │
                                                        ▼
                        App Server (Kestrel / ASP.NET Core / Docker)
                                                        │
                     ┌──────────────────┬──────────────┐│
                     ▼                  ▼              ▼▼
                   Redis           SQL Server      Cloudinary
                 (cache)          (primary DB)   (media storage)
```

### Chi tiết từng bước

1. **Client nhập URL** (`https://api.soldcars.com/hr/technicians`)
2. **DNS resolution** — trình duyệt query DNS server để lấy IP của `api.soldcars.com`. Kết quả có thể được cache ở OS resolver / browser.
3. **TCP handshake + TLS handshake** — 3-way handshake TCP, rồi TLS (ALPN → HTTP/2).
4. **HTTP request** — gửi request line (`GET /hr/technicians HTTP/2`), headers (`Authorization: Bearer ...`, `Accept`, `Accept-Encoding`...).
5. **CDN / Edge** — nếu endpoint là public & cacheable (GET `/brand`, GET `/car/{id}`), Cloudflare / Fastly có thể trả về ngay từ edge, bỏ qua origin.
6. **Load Balancer** — phân phối request tới các backend instance theo thuật toán (xem `load-balancing.md`).
7. **Reverse proxy / TLS termination** — Nginx / Cloud Load Balancer terminate TLS, forward plain HTTP về Kestrel (kèm `X-Forwarded-For`, `X-Forwarded-Proto`).
8. **ASP.NET Core pipeline** — Middleware pipeline lần lượt chạy:
   - `UseForwardedHeaders` → đọc lại client IP thật
   - `UseCors` → kiểm tra Origin
   - `UseAuthentication` → parse JWT Bearer token
   - `UseJwtBlacklist` → kiểm tra token đã revoke chưa (Redis lookup)
   - `UseAuthorization` → kiểm tra roles
   - **Endpoint** → controller action
9. **Controller → Service → DB/Cache** — business logic:
   - Kiểm tra Redis cache trước (đọc cache-aside pattern)
   - Nếu miss: query SQL Server qua EF Core (projection `AsNoTracking`)
   - Upload file nếu cần (Cloudinary)
   - Trả `OperationResult`
10. **Response** — serialize JSON, gzip/br compress, ghi vào stream → TLS → TCP → client.

---

## 2. Các điểm chậm (bottlenecks) thường gặp

| Bước | Bottleneck tiềm năng | Cách tối ưu |
|------|---------------------|-------------|
| DNS | Cold DNS lookup | TTL hợp lý, HTTP/2 preconnect |
| TLS | Handshake tốn RTT | TLS 1.3, HTTP/2, session resumption |
| CDN miss | Mỗi request về origin | Cache GET endpoints public |
| LB | Round-robin không phù hợp workload nặng | Least Connections, Weighted RR |
| Auth | JWT validate mỗi request | Short-circuit cho endpoint public |
| DB | N+1 query | Projection + `Include` + `AsSplitQuery` |
| DB | Không index | Thêm index cho WHERE/JOIN/ORDER BY column |
| Serialization | Object tree lớn | Dùng ViewModel, tránh expose entity thẳng |
| Response size | JSON to | Gzip/Brotli, pagination |

---

## 3. Luồng cụ thể cho SoldCars API

Ví dụ: `GET /workshop/work-orders/{id}`

```
1. AuthController validate JWT
   └─ Redis check: jwt:revoked:{jti}?   → blacklist middleware

2. WorkOrderController.GetById(id)
   └─ IWorkOrderServices.GetByIdAsync(id)

3. Services layer:
   ├─ Check L1 Redis cache: "wo:{id}" → hit? return
   ├─ EF query with Include(Vehicle).Include(Services).Include(Parts)
   │   └─ Projection → WorkOrderViewModel
   ├─ Set Redis cache (TTL 5 phút)
   └─ Return vm

4. Response serialized as JSON, compressed (br), returned.
```

Nếu request miss cache và DB query mất 200ms, toàn bộ flow có thể ~250ms (network + TLS + middleware + DB + serialize).
Nếu hit cache Redis và response gzip: ~30–50ms.

---

## 4. Tham khảo

- [Load Balancing algorithms](load-balancing.md)
- [API Optimization checklist](api-optimization.md)
- ASP.NET Core request pipeline: <https://learn.microsoft.com/aspnet/core/fundamentals/middleware>

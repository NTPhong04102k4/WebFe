# Commands Cheat Sheet — SoldCars Web API

Tổng hợp các lệnh thường dùng cho dự án (ASP.NET Core 8 + SQL Server + Redis + Docker).

> Project name: `Web` • Output DLL: `Web.dll` • Default HTTP: `http://localhost:5000` • HTTPS: `https://localhost:7250`

---

## 1. .NET Build / Run / Debug

### Restore & Build

```bash
# Restore NuGet packages
dotnet restore

# Build Debug (mặc định)
dotnet build

# Build Release
dotnet build -c Release

# Publish ra thư mục /app/publish (giống Dockerfile)
dotnet publish Web.csproj -c Release -o ./publish /p:UseAppHost=false

# Clean toàn bộ bin/obj
dotnet clean
```

### Run (local)

```bash
# Chạy profile "http" (http://localhost:5000)
dotnet run --launch-profile http

# Chạy profile "https" (https://localhost:7250 + http://localhost:5000)
dotnet run --launch-profile https

# Watch mode (hot reload)
dotnet watch run --launch-profile https

# Chạy với environment cụ thể
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

### Debug

```bash
# Attach VS Code / VS debugger vào process đã chạy
dotnet run --launch-profile https
# → mở VS Code → F5 → "Attach to .NET" → chọn process Web

# Bật log Debug chi tiết (đã cấu hình sẵn trong appsettings.json)
# Logging:LogLevel:Default = Debug, Web = Debug

# Kiểm tra port đang lắng nghe (Windows)
netstat -ano | findstr ":5000"
netstat -ano | findstr ":7250"

# Kill process đang giữ port
taskkill /PID <pid> /F
```

### EF Core Migrations

```bash
# Cài global tool (chạy 1 lần)
dotnet tool install --global dotnet-ef

# Tạo migration mới
dotnet ef migrations add <MigrationName>

# Apply migration vào DB
dotnet ef database update

# Rollback về migration trước đó
dotnet ef database update <PreviousMigrationName>

# Xem SQL sẽ chạy (không apply)
dotnet ef migrations script

# Xóa migration cuối (chưa apply)
dotnet ef migrations remove
```

---

## 2. Docker — Image & Container

### Build Image

```bash
# Build image từ Dockerfile (tag: soldcars-web:latest)
docker build -t soldcars-web:latest .

# Build không dùng cache (rebuild sạch)
docker build --no-cache -t soldcars-web:latest .

# Build cho target stage cụ thể (debug stage "build")
docker build --target build -t soldcars-web:build .

# Xem image vừa build
docker images | findstr soldcars-web
```

### Run Container

```bash
# Run container map port 5000, có .env
docker run -d --name soldcars-web -p 5000:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e Redis__ConnectionString=host.docker.internal:6379 \
  soldcars-web:latest

# Run interactive (xem log realtime)
docker run --rm -it -p 5000:8080 soldcars-web:latest

# Run với mount volume (dev)
docker run --rm -it -p 5000:8080 \
  -v ${PWD}:/app/source \
  soldcars-web:latest
```

### Quản lý Container

```bash
# List container đang chạy
docker ps

# List tất cả (kể cả đã stop)
docker ps -a

# Stop / Start / Restart
docker stop soldcars-web
docker start soldcars-web
docker restart soldcars-web

# Xóa container
docker rm -f soldcars-web

# Xóa image
docker rmi soldcars-web:latest

# Dọn dẹp image/container/volume không dùng
docker system prune -a
```

### Debug Container

```bash
# Xem log
docker logs soldcars-web
docker logs -f soldcars-web          # follow realtime
docker logs --tail 100 soldcars-web  # 100 dòng cuối

# Vào shell bên trong container
docker exec -it soldcars-web /bin/bash
docker exec -it soldcars-web sh       # nếu không có bash

# Xem process, memory, CPU
docker stats soldcars-web
docker top soldcars-web

# Inspect chi tiết
docker inspect soldcars-web

# Copy file từ container ra host
docker cp soldcars-web:/app/appsettings.json ./

# Xem network bridge
docker network ls
docker network inspect bridge
```

---

## 3. Redis

### Cài & Chạy Redis bằng Docker

```bash
# Pull image Redis 7 (alpine nhẹ)
docker pull redis:7-alpine

# Run Redis container (port 6379)
docker run -d --name soldcars-redis -p 6379:6379 redis:7-alpine

# Run Redis có persistence (AOF)
docker run -d --name soldcars-redis -p 6379:6379 \
  -v soldcars-redis-data:/data \
  redis:7-alpine redis-server --appendonly yes

# Run có password
docker run -d --name soldcars-redis -p 6379:6379 \
  redis:7-alpine redis-server --requirepass YourStrongPassword123
```

### Kết nối từ App

App dùng connection string từ `appsettings.json`:

```json
"Redis": {
  "ConnectionString": "localhost:6379",
  "InstanceName": "SoldCars:",
  "DefaultTtlSeconds": 3600
}
```

- Nếu chạy app trong Docker, đổi thành `host.docker.internal:6379` (Windows/Mac) hoặc `172.17.0.1:6379` (Linux).
- Mọi key được prefix bằng `SoldCars:` (xem [RedisService.cs](../Services/Common/Cache/RedisService.cs)).

### Redis CLI — Debug Keys

```bash
# Vào redis-cli trong container
docker exec -it soldcars-redis redis-cli

# Kết nối với password
docker exec -it soldcars-redis redis-cli -a YourStrongPassword123

# Từ host (nếu đã cài redis-tools)
redis-cli -h localhost -p 6379
```

### Lệnh Redis thường dùng (trong redis-cli)

```redis
# ── Kết nối & info ─────────────────────────────
PING                              # → PONG
INFO                              # info tổng quát
INFO memory                       # memory usage
DBSIZE                            # số key trong DB hiện tại
CLIENT LIST                       # list client đang connect

# ── Xem key ────────────────────────────────────
KEYS SoldCars:*                   # ⚠ chỉ dev; prod dùng SCAN
SCAN 0 MATCH SoldCars:* COUNT 100

# Key theo module (dùng trong project — xem Common/RedisKeys.cs)
KEYS SoldCars:otp:*
KEYS SoldCars:refresh:*
KEYS SoldCars:jwt:blacklist:*
KEYS SoldCars:temp-pwd:*

# ── Đọc / Ghi ─────────────────────────────────
GET SoldCars:otp:user@mail.com
TYPE SoldCars:otp:user@mail.com
TTL SoldCars:otp:user@mail.com    # giây còn lại; -1 = no expire, -2 = không tồn tại
SET mykey "hello" EX 60           # set với TTL 60s

# ── Xóa ───────────────────────────────────────
DEL SoldCars:otp:user@mail.com
UNLINK SoldCars:otp:user@mail.com # xóa async (khuyến nghị)

# Xóa theo pattern (an toàn hơn KEYS + DEL)
redis-cli --scan --pattern "SoldCars:otp:*" | xargs redis-cli UNLINK

# ── Expire / TTL ──────────────────────────────
EXPIRE mykey 120                  # set TTL 120s
PERSIST mykey                     # bỏ TTL

# ── Flush (⚠ cẩn thận) ────────────────────────
FLUSHDB                           # xóa DB hiện tại
FLUSHALL                          # xóa tất cả DB

# ── Debug / Monitor ───────────────────────────
MONITOR                           # realtime tất cả command (Ctrl+C để thoát)
SLOWLOG GET 10                    # 10 command chậm nhất
DEBUG OBJECT mykey                # chi tiết object
MEMORY USAGE mykey                # byte key chiếm

# ── Pub/Sub test ──────────────────────────────
SUBSCRIBE channel1
PUBLISH channel1 "hello"
```

### Redis trong Project (namespace key)

App gom key bằng [Common/RedisKeys.cs](../Common/RedisKeys.cs). Mẫu key thường gặp:

| Module | Key pattern | Tác dụng |
|--------|-------------|----------|
| OTP | `SoldCars:otp:{email}` | OTP verify email |
| Refresh token | `SoldCars:refresh:{userId}:{jti}` | Rotate refresh token |
| JWT blacklist | `SoldCars:jwt:blacklist:{jti}` | Logout / revoke |
| Temp password | `SoldCars:temp-pwd:{userId}` | Quên mật khẩu |

---

## 4. SQL Server (local)

```bash
# Kiểm tra service SQL Server đang chạy (Windows)
sc query MSSQL$SQLEXPRESS

# Connect bằng sqlcmd
sqlcmd -S LAPTOP-VUB71TLF\SQLEXPRESS -E -d SoldCars

# Trong sqlcmd
1> SELECT name FROM sys.tables;
2> GO
1> EXIT
```

Connection string trong `appsettings.json`:
```
Data Source=LAPTOP-VUB71TLF\SQLEXPRESS;Initial Catalog=SoldCars;Integrated Security=True;...
```

---

## 5. Git (dự án)

```bash
git status
git add <file>
git commit -m "feat(module): message"
git push origin master

# Xem commit gần nhất
git log --oneline -10

# Diff staged
git diff --cached
```

Xem convention commit tại [docs/git_commit/README.md](git_commit/README.md).

---

## 6. Quick Troubleshoot

| Triệu chứng | Lệnh kiểm tra |
|------------|---------------|
| App không connect Redis | `docker ps` → có container redis? • `docker logs soldcars-redis` • `redis-cli PING` |
| Port 5000/7250 bị chiếm | `netstat -ano \| findstr ":5000"` → `taskkill /PID <pid> /F` |
| Migration fail | `dotnet ef migrations list` • check connection string • `dotnet ef database update --verbose` |
| Container crash liên tục | `docker logs --tail 200 soldcars-web` • `docker inspect soldcars-web` |
| Key Redis không thấy | Nhớ prefix `SoldCars:` • `SCAN 0 MATCH SoldCars:*` |
| JWT bị revoke | `KEYS SoldCars:jwt:blacklist:*` → `GET <key>` |

# Công cụ tài liệu (`docs/tools`)

## Export OpenAPI → `docs/api/swagger.json`

Mục đích: tạo file schema OpenAPI 3 để FE / AI diff khi API đổi; **bổ sung** cho markdown trong `docs/api/`, không thay thế review PR.

### Yêu cầu

1. .NET 8 SDK.
2. Tool CLI (đã khai báo trong [`.config/dotnet-tools.json`](../../.config/dotnet-tools.json) ở gốc repo Web).
3. Biến môi trường **`ConnectionStrings__DefaultConnection`** hợp lệ (PostgreSQL) — `Program.cs` cần connection string khi build host cho Swagger; có thể lấy từ `.env.local` ở gốc project Web (cùng cách chạy API).

### Chạy (PowerShell, từ thư mục gốc repo `Web/`)

```powershell
powershell -ExecutionPolicy Bypass -File docs/tools/export-openapi.ps1
```

Tùy chọn:

```powershell
$env:ConnectionStrings__DefaultConnection = "Host=...;Database=...;Username=...;Password=..."
powershell -ExecutionPolicy Bypass -File docs/tools/export-openapi.ps1 -Configuration Release
```

Output: `docs/api/swagger.json` (ghi đè nếu đã có).

### CI (tuỳ chọn)

Workflow [`.github/workflows/openapi-export.yml`](../../.github/workflows/openapi-export.yml) — chạy **thủ công** (`workflow_dispatch`). Thiết lập repository secret **`OPENAPI_DEFAULT_CONNECTION`** (connection string PostgreSQL đọc được từ runner hoặc VPN). Không bật mặc định trên mọi PR để tránh lộ chuỗi kết nối.

### Sau khi export

- Commit `docs/api/swagger.json` nếu team muốn theo dõi diff trên Git.
- Cập nhật markdown (`endpoint-status-map`, `api/modules`) khi đổi controller — xem checklist trong `docs/api/frontend-api-reference.md`.

# API — hướng dẫn cho Frontend

> **Cửa vào tổng cho team FE:** [../FE-START.md](../FE-START.md) · [../DOCUMENTATION_MAP.md](../DOCUMENTATION_MAP.md)

- **Swagger UI (dev):** `/swagger` — thử endpoint và xem schema.
- **OpenAPI JSON (tạo bởi script, dùng để diff / codegen):** `swagger.json` — xem [../tools/README.md](../tools/README.md).
- **Tài liệu tổng hợp:** [frontend-api-reference.md](./frontend-api-reference.md) — route, phương thức, auth, JSON/multipart, và mapping DTO (Input / ViewModel). Có **checklist đồng bộ PR**.
- **Map đầy đủ endpoint + payload + response + status code:** [endpoint-status-map.md](./endpoint-status-map.md)
- **Theo từng feature (payload + response chi tiết):** [modules/README.md](./modules/README.md)

**Base URL:** không hardcode host deploy trong mã FE — dùng `VITE_API_BASE_URL` (mẫu: [../fe.env.example](../fe.env.example)). Local mặc định thường là `https://localhost:7250` hoặc `http://localhost:5000` (xem `Properties/launchSettings.json`). Không có prefix `api/` toàn cục; path đúng như trong bảng tài liệu.

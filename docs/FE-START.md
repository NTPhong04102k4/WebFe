# SoldCars — Cửa vào cho Frontend (React)

Đọc file này trước khi đọc các tài liệu khác trong `docs/`.

## Thứ tự đọc (bắt buộc cho contract API)

1. **[FRONTEND_CLAUDE.md](./FRONTEND_CLAUDE.md)** — stack UI (Vite, React Router, TanStack Query, Axios, Zustand, shadcn), cấu trúc thư mục `src/`, pattern auth/interceptor.
2. **[api/README.md](./api/README.md)** — cổng vào HTTP: Swagger, link tới bảng route tổng hợp, base URL local.
3. **[api/modules/README.md](./api/modules/README.md)** — **contract chi tiết** theo feature (payload JSON/multipart, response, status code).
4. Khi cần bảng đầy đủ status + payload: **[api/endpoint-status-map.md](./api/endpoint-status-map.md)**.
5. Bảng route nhanh + DTO: **[api/frontend-api-reference.md](./api/frontend-api-reference.md)**.

## Base URL — không hardcode host deploy

- Dùng **`VITE_API_BASE_URL`** (xem [fe.env.example](./fe.env.example)).
- Local mặc định thường là `https://localhost:7250` hoặc `http://localhost:5000` — xem `Properties/launchSettings.json` trong repo Web API.
- Mỗi môi trường (dev/staging/prod) đặt URL riêng trong `.env` / CI secrets; **không** cam kết một URL cố định trong tài liệu ngoài ví dụ placeholder.

## Tránh đọc nhầm hai lớp tài liệu

| Vị trí | Mục đích | Khi gọi API |
|--------|-----------|-------------|
| `docs/<feature>/` (vd. `brand/`, `car/`) | Mô tả endpoint theo domain, có thể kèm UX / giải thích nghiệp vụ | Chỉ tham khảo; **ưu tiên đối chiếu** `api/modules/*.md` |
| **`docs/api/modules/*.md`** | Contract cho FE: path, method, auth, body, lỗi | **Nguồn ưu tiên** khi implement `*.api.ts` |

**Ví dụ:** Brand / body type / location public list — xem **`api/modules/common-catalog.md`**, không chỉ dựa vào `docs/brand/brand.md` nếu hai nguồn lệch nhau.

## Phân biệt route React vs route API

| Ý nghĩa | Ví dụ |
|---------|--------|
| **Route trang** (React Router) | `/ai-chat` → trang chatbot |
| **Path API** (Axios gọi backend) | `/ai/chat`, `/ai/sessions`, … |

Luôn gọi API theo `[Route]` trong Web API (`Controllers/`), đã được ghi trong `api/modules/`.

## OpenAPI (schema máy đọc)

- File **`api/swagger.json`** được tạo bởi script (không chỉnh tay để “đúng schema”).
- Hướng dẫn: [tools/README.md](./tools/README.md).

## Checklist khi đổi backend (PR)

Xem mục **“Checklist đồng bộ tài liệu (PR)”** trong [api/frontend-api-reference.md](./api/frontend-api-reference.md).

## Bản đồ đầy đủ hai lớp tài liệu

[DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md)

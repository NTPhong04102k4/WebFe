# Bản đồ tài liệu `docs/`

## Hai lớp nội dung

| Lớp | Đường dẫn | Mục đích |
|-----|-----------|----------|
| **A — Nghiệp vụ / mô tả theo domain** | `docs/auth/`, `docs/brand/`, `docs/car/`, `docs/category/`, `docs/accessory/`, `docs/bodytype/`, `docs/location/`, `docs/order/`, `docs/user/`, … | Giải thích flow, endpoint theo chủ đề; có thể cập nhật lệch thời so với code. |
| **B — Contract API cho FE** | **`docs/api/modules/*.md`**, `docs/api/endpoint-status-map.md`, `docs/api/frontend-api-reference.md` | **Chuẩn khi implement** gọi HTTP: path, method, auth, payload, status, `OperationResult`. |

**Quy tắc:** Khi implement React (`*.api.ts`, types, form submit), luôn **chốt** với lớp **B** + Swagger `/swagger`. Lớp **A** dùng để hiểu nghiệp vụ hoặc onboarding nhanh.

## Cửa vào theo vai trò

| Ai | Bắt đầu từ |
|----|------------|
| Frontend React | [FE-START.md](./FE-START.md) |
| Backend / full stack | [README.md](./README.md) (API) + [project-overview.md](./project-overview.md) |
| AI / codegen | [FE-START.md](./FE-START.md) + `api/modules/` cho feature đang sinh |

## Feature song song (A ↔ B)

| Domain (A) | Contract tập trung (B) |
|------------|-------------------------|
| `brand/`, `bodytype/`, `location/` (base `/common`) | [api/modules/common-catalog.md](./api/modules/common-catalog.md) |
| `auth/` | [api/modules/auth.md](./api/modules/auth.md) |
| `car/` | [api/modules/car.md](./api/modules/car.md) |
| `accessory/`, `category/` | [api/modules/accessory-category.md](./api/modules/accessory-category.md) |
| `order/` | [api/modules/orders-payment.md](./api/modules/orders-payment.md) |
| `user/` | [api/modules/user-profile.md](./api/modules/user-profile.md) |
| — | [api/modules/hr.md](./api/modules/hr.md), [api/modules/insurance.md](./api/modules/insurance.md), [api/modules/workshop.md](./api/modules/workshop.md), [api/modules/review.md](./api/modules/review.md), [api/modules/chat.md](./api/modules/chat.md), [api/modules/ai-chatbot.md](./api/modules/ai-chatbot.md) |

## Khác

- **SePay + React:** [features/orders/sepay-react-vite.md](./features/orders/sepay-react-vite.md) — luồng thanh toán; `VITE_API_BASE_URL` phải trỏ cùng backend với app.
- **Kiến trúc / infra:** [architecture/](./architecture/).
- **Export OpenAPI:** [tools/README.md](./tools/README.md).

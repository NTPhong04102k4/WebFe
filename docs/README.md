# SoldCars API — Tài liệu API

Tài liệu API cho hệ thống bán xe SoldCars (ASP.NET Core 8.0).

> **Tổng quan toàn dự án (stack, entity, service, cấu hình):** [project-overview.md](project-overview.md)

---

## Modules

| Module | File | Base Path |
|--------|------|-----------|
| Auth | [auth/auth.md](auth/auth.md) | `/auth`, `/auth/admin` |
| Brand | [brand/brand.md](brand/brand.md) | `/common` |
| BodyType | [bodytype/bodytype.md](bodytype/bodytype.md) | `/common` |
| Location | [location/location.md](location/location.md) | `/common` |
| Car | [car/car.md](car/car.md) | `/car` |
| Category | [category/category.md](category/category.md) | `/category` |
| Accessory | [accessory/accessory.md](accessory/accessory.md) | `/accessory` |
| Order & Payment | [order/order.md](order/order.md) | `/orders/payment` |
| User | [user/user.md](user/user.md) | `/user`, `/user/files` |
| HR | [api/modules/hr.md](api/modules/hr.md) | `/hr` |
| Insurance | [api/modules/insurance.md](api/modules/insurance.md) | `/insurance` |
| Workshop | [api/modules/workshop.md](api/modules/workshop.md) | `/workshop` |
| Review | [api/modules/review.md](api/modules/review.md) | `/review` |
| Chat | [api/modules/chat.md](api/modules/chat.md) | `/chat` |
| AI Chatbot | [api/modules/ai-chatbot.md](api/modules/ai-chatbot.md) | `/ai-chat` |

---

## Quy ước chung

### Auth Header
```
Authorization: Bearer <access_token>
```

### Response Wrapper (write operations)
```json
{
  "success": true,
  "errorCode": null,
  "message": "string",
  "data": {}
}
```

### ErrorCode chuẩn
| Code | Tình huống |
|------|-----------|
| `ValidationError` | Dữ liệu đầu vào sai format |
| `NotFound` | Resource không tồn tại |
| `EmailExists` | Email đã được đăng ký |
| `UsernameExists` | Username đã tồn tại |
| `PhoneExists` | SĐT đã tồn tại |
| `Unauthorized` | Không có quyền truy cập |
| `InvalidCredentials` | Sai thông tin đăng nhập |
| `InternalError` | Lỗi server không xác định |

### Roles
| Role | Mô tả |
|------|-------|
| `SuperAdmin` | Quyền cao nhất, quản lý staff |
| `Admin` | Quản lý nội dung, xe, phụ kiện |
| `Staff` | Xem và hỗ trợ đơn hàng |
| `Customer` | Người dùng thông thường |

### File Upload
- **Ảnh:** max 10MB; jpeg, jpg, png, gif, webp
- **Video:** max 50MB; mp4, avi, mov, mkv, webm
- **Ảnh phụ kiện:** max 5MB
- Content-Type: `multipart/form-data`

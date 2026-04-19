# Feature modules — API (payload & response)

Mỗi file mô tả một **nhóm nghiệp vụ**: endpoint, **payload gửi lên** (JSON / query / multipart), và **dữ liệu trả về** thường gặp (HTTP 200/201; lỗi xem cuối file).

Tổng quan route: [../frontend-api-reference.md](../frontend-api-reference.md).

| Module | File |
|--------|------|
| Đăng nhập / đăng ký / token | [auth.md](./auth.md) |
| Người dùng & upload file | [user-profile.md](./user-profile.md) |
| Đơn hàng & thanh toán SePay | [orders-payment.md](./orders-payment.md) |
| Xe (CRUD, paging, thông số kỹ thuật) | [car.md](./car.md) |
| Phụ kiện & danh mục | [accessory-category.md](./accessory-category.md) |
| Dữ liệu chung (brand, body type, location) | [common-catalog.md](./common-catalog.md) |
| Nhân sự (kỹ thuật viên, lương, …) | [hr.md](./hr.md) |
| Bảo hiểm | [insurance.md](./insurance.md) |
| Xưởng (xe khách, lịch hẹn, phiếu CV) | [workshop.md](./workshop.md) |

**Quy ước JSON:** camelCase (trừ `TokenResponse` dùng `access_token`, `refresh_token`, …).  
**Lỗi chung:** `401 Unauthorized`, `403 Forbidden`, `404 NotFound`, `409 Conflict`; body thường là `{ "success": false, "errorCode": "...", "message": "..." }` (`OperationResult`) hoặc `{ "error": "..." }`.

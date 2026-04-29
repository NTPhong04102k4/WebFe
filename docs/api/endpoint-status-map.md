# API Endpoint Map (Payload / Response / Status Code)

Tài liệu này map theo source code hiện tại trong `Controllers`.  
Mục tiêu: nhìn nhanh **endpoint**, **InputModel/payload**, **response data/view model**, và **HTTP status code**.

## Quy ước status code

- `200 OK`: đọc dữ liệu hoặc thao tác thành công (đa số endpoint).
- `201 Created`: tạo mới thành công (một số endpoint trả `StatusCode(201, ...)`).
- `400 BadRequest`: payload/query không hợp lệ hoặc lỗi nghiệp vụ dạng thường.
- `401 Unauthorized`: chưa đăng nhập/token sai/không đủ điều kiện xác thực.
- `403 Forbidden`: có token nhưng không đủ role.
- `404 NotFound`: không tìm thấy dữ liệu.
- `409 Conflict`: xung đột dữ liệu (email tồn tại, trạng thái xung đột, ...).
- `422 UnprocessableEntity`: các endpoint dùng `ToActionResult(...)` với `ErrorCode = ValidationError`.
- `500 InternalServerError`: một số endpoint xử lý lỗi nội bộ thủ công.

> Với endpoint trả qua `ToActionResult(result)`, status code lỗi phụ thuộc `result.ErrorCode` tại `Common/OperationResultHttpExtensions.cs`.

## 1) Auth

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| POST | `/auth/login` | `LoginRequest` (JSON) | `TokenResponse` (`access_token`, `refresh_token`, ...) | `200`, `401` |
| POST | `/auth/register` | `RegisterRequest` (JSON) | `OperationResult` | `200`, `400`, `409`, `500` |
| POST | `/auth/verify-otp` | `VerifyOtpRequest` (JSON) | `OperationResult` (data chứa token + user) | `201`, `400` |
| POST | `/auth/resend-otp` | `ResendOtpRequest` (JSON) | `OperationResult` | `200`, `400`, `409`, `500` |
| POST | `/auth/logout` | `LogoutRequest?` (JSON) | `OperationResult` | `200`, `401`, `403` |
| POST | `/auth/refresh-token` | `RefreshTokenRequest` (JSON) | `TokenResponse` | `200`, `400`, `401` |
| GET | `/auth/login/google` | - | redirect OAuth | `302` (redirect flow) |
| GET | `/auth/callback/google` | - | HTML popup script (`postMessage`) | `200` |
| GET | `/auth/login/facebook` | - | redirect OAuth | `302` (redirect flow) |
| GET | `/auth/callback/facebook` | - | HTML popup script (`postMessage`) | `200` |
| POST | `/auth/admin/login` | `LoginAdminRequest` (JSON) | token/admin login result | `200`, `401` |
| POST | `/auth/admin/staff/create` | `CreateStaffRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/auth/admin/staff/{staffId}/password` | `UpdateStaffPasswordRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/auth/admin/superadmin/recover-password` | `SuperAdminRecoverPasswordRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |

## 2) User + File upload

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/user/detail?gmailOrUserName=` | query string | `OperationResult.data` (user profile) | `200`, `404`, `401`, `403` |
| POST | `/user/update-profile` | `UpdateUserProfilesInput` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `404`, `401`, `403` |
| PATCH | `/user/changepassword?passwordOld=&newPassword=&username=` | query string | `OperationResult` | `200`, `400`, `401`, `404`, `403` |
| PATCH | `/user/forgetPassword?email=` | query string | `OperationResult` | `200`, `400`, `404`, `500` |
| POST | `/user/verifyOtpForPassword` | `VerifyOtpForPasswordRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404` |
| POST | `/user/resetPasswordWithTemp` | `ResetPasswordWithTempRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `500` |
| POST | `/user/send-gmail-message` | `GmailMessageRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `500` |
| POST | `/user/files/upload` | `FileUploadRequest` (multipart/form-data, field `file`) | `{ url }` | `200`, `400` |

## 3) Car

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/car/detail?id=` | query `id` | `OperationResult.data` (car detail view model) | `200`, `404` |
| POST | `/car/paging` | query `CarPagingRequest` | `OperationResult.data = { data, totalCount }` | `200` |
| POST | `/car/create` | `CarRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| PUT | `/car/edit?id=` | query `id` + `CarRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| GET | `/car/techSpec/detail?id=` | query `id` | `OperationResult.data` | `200`, `404` |
| PATCH | `/car/techSpec/edit?id=` | query `id` + `CarDetailRequest` (JSON) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| POST | `/car/techSpec/create` | `CarDetailRequest` (JSON) | `OperationResult.data` | `200`, `400`, `401`, `403` |

## 4) Accessory + Category

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/accessory/detail?accessoryId=` | query | accessory detail | `200`, `404` |
| GET | `/accessory/all` | query `AccessoriesPagingRequest` | `AccessoriesPagedResponse` | `200`, `400` |
| POST | `/accessory/create` | `AccessoriesRequest` (multipart/form-data) | created accessory | `201`, `400`, `401`, `403` |
| PUT | `/accessory/edit?id=` | query `id` + `AccessoriesRequest` (multipart/form-data) | updated accessory | `200`, `400`, `401`, `403` |
| GET | `/category/all` | - | `OperationResult.data` (list category) | `200`, `404` |
| GET | `/category/detail?categoryId=` | query | `OperationResult.data` | `200`, `404` |
| POST | `/category/create` | `CategoryRequest` (JSON) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| PUT | `/category/edit?id=` | query `id` + `CategoryRequest` (JSON) | `OperationResult.data` | `200`, `400`, `401`, `403` |

## 5) Common catalog (Brand / BodyType / Location)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/common/brands` | - | `OperationResult.data` (brand list) | `200`, `404` |
| POST | `/common/brand/create` | `BrandRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| PATCH | `/common/brand/edit` | `BrandRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| GET | `/common/brand_accessories` | - | `OperationResult.data` | `200`, `404` |
| POST | `/common/brand_accessory/create` | `BrandAccessoryRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| PATCH | `/common/brand_accessory/edit` | `BrandAccessoryRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| GET | `/common/bodytypes` | - | `OperationResult.data` | `200`, `404` |
| POST | `/common/bodytype/create` | `BodyCarRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `401`, `403` |
| PUT | `/common/bodytype/update` | `BodyCarUpdateRequest` (multipart/form-data) | `OperationResult.data` | `200`, `400`, `404`, `401`, `403` |
| GET | `/common/location?ip=` | query `ip` | `OperationResult.data` | `200`, `404` |
| GET | `/common/locations` | - | `OperationResult.data` | `200`, `404` |

## 6) Orders / Payment

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/orders/payment/orders?page=&pageSize=` | query | `{ data, totalCount }` | `200`, `401`, `403` |
| GET | `/orders/payment/order/{orderNumber}` | path param | `OperationResult.data` (`OrderViewModel`) | `200`, `404`, `401`, `403` |
| GET | `/orders/payment/order/{orderNumber}/payment-info` | path param | `OperationResult.data` (`SepayPaymentInfo`) | `200`, `404`, `401`, `403` |
| POST | `/orders/payment/order` | `OrderInput` (JSON) | `OperationResult` (create result) | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PATCH | `/orders/payment/order/{id}/status` | `UpdateOrderStatusInput` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/orders/payment/sepay-ipn` | `SepayWebhookPayload` (JSON) + header `Authorization: Apikey ...` | `{ success, message? }` | `200`, `400` |

## 7) HR

### 7.1 Skills (`hr/skills`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/hr/skills` | - | list `SkillViewModel` | `200` |
| GET | `/hr/skills/{id}` | path param | `SkillViewModel` | `200`, `404` |
| POST | `/hr/skills` | `SkillRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/hr/skills/{id}` | `SkillRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/hr/skills/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 7.2 Technician levels (`hr/technician-levels`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/hr/technician-levels` | - | list `TechnicianLevelViewModel` | `200` |
| GET | `/hr/technician-levels/{id}` | - | `TechnicianLevelViewModel` | `200`, `404` |
| POST | `/hr/technician-levels` | `TechnicianLevelRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/hr/technician-levels/{id}` | `TechnicianLevelRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/hr/technician-levels/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 7.3 Technicians (`hr/technicians`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/hr/technicians` | query (`page`, `pageSize`, `available`) | `{ data, totalCount, page, pageSize }` | `200` |
| GET | `/hr/technicians/available` | - | list technician | `200` |
| GET | `/hr/technicians/{id}` | - | `TechnicianViewModel` | `200`, `404` |
| GET | `/hr/technicians/{id}/skills` | - | list `TechnicianSkillViewModel` | `200` |
| GET | `/hr/technicians/{id}/performance` | - | `TechnicianPerformanceViewModel` | `200`, `404`, `401`, `403` |
| POST | `/hr/technicians` | `TechnicianRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/hr/technicians/{id}` | `TechnicianRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/hr/technicians/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/hr/technicians/{id}/skills` | `AssignSkillRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/hr/technicians/{id}/skills/{skillId}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 7.4 Payroll (`hr/payrolls`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/hr/payrolls` | query (`page`, `pageSize`, `staffId`, `period`) | `{ data, totalCount, page, pageSize }` | `200`, `401`, `403` |
| GET | `/hr/payrolls/{id}` | - | `PayrollViewModel` | `200`, `404`, `401`, `403` |
| POST | `/hr/payrolls` | `PayrollRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/hr/payrolls/{id}` | `PayrollRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| PATCH | `/hr/payrolls/{id}/pay` | `PayrollPaymentRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/hr/payrolls/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

## 8) Insurance

### 8.1 Companies (`insurance/companies`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/insurance/companies` | - | list `InsuranceCompanyViewModel` | `200` |
| GET | `/insurance/companies/{id}` | - | `InsuranceCompanyViewModel` | `200`, `404` |
| POST | `/insurance/companies` | `InsuranceCompanyRequest` (multipart/form-data) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/insurance/companies/{id}` | `InsuranceCompanyRequest` (multipart/form-data) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/insurance/companies/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 8.2 Packages (`insurance/packages`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/insurance/packages?companyId=` | query | list `InsurancePackageViewModel` | `200` |
| GET | `/insurance/packages/{id}` | - | `InsurancePackageViewModel` | `200`, `404` |
| POST | `/insurance/packages` | `InsurancePackageRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/insurance/packages/{id}` | `InsurancePackageRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/insurance/packages/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 8.3 Policies (`insurance/policies`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/insurance/policies` | query (`page`, `pageSize`, `userId`, `status`) | `{ data, totalCount, page, pageSize }` | `200`, `401` |
| GET | `/insurance/policies/expiring` | query `withinDays` | list policy expiring | `200`, `401`, `403` |
| GET | `/insurance/policies/{id}` | - | `InsurancePolicyViewModel` | `200`, `404`, `401` |
| POST | `/insurance/policies` | `InsurancePolicyRequest` (multipart/form-data) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| PATCH | `/insurance/policies/{id}/cancel` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 8.4 Claims (`insurance/claims`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/insurance/claims` | query (`page`, `pageSize`, `status`) | `{ data, totalCount, page, pageSize }` | `200`, `401` |
| GET | `/insurance/claims/{id}` | - | `InsuranceClaimViewModel` | `200`, `404`, `401` |
| POST | `/insurance/claims` | `InsuranceClaimRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| PATCH | `/insurance/claims/{id}/status` | `InsuranceClaimStatusRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

## 9) Workshop

### 9.1 Customer vehicles (`workshop/customer-vehicles`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/workshop/customer-vehicles` | query (`page`, `pageSize`, `userId`) | `{ data, totalCount, page, pageSize }` | `200`, `401` |
| GET | `/workshop/customer-vehicles/{id}` | - | `CustomerVehicleViewModel` | `200`, `404`, `401` |
| GET | `/workshop/customer-vehicles/{id}/maintenance-history` | - | list `MaintenanceHistoryViewModel` | `200`, `401` |
| POST | `/workshop/customer-vehicles` | `CustomerVehicleRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| PUT | `/workshop/customer-vehicles/{id}` | `CustomerVehicleRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| PATCH | `/workshop/customer-vehicles/{id}/mileage` | `CustomerVehicleUpdateMileageRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| DELETE | `/workshop/customer-vehicles/{id}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 9.2 Appointments (`workshop/appointments`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/workshop/appointments` | query `AppointmentQueryRequest` | `{ data, totalCount, page, pageSize }` | `200`, `401` |
| GET | `/workshop/appointments/{id}` | - | `AppointmentViewModel` | `200`, `404`, `401` |
| POST | `/workshop/appointments` | `AppointmentRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| PUT | `/workshop/appointments/{id}/confirm` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/workshop/appointments/{id}/cancel` | `AppointmentStatusRequest?` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| PATCH | `/workshop/appointments/{id}/status` | `AppointmentStatusRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/workshop/appointments/{id}/send-reminder` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

### 9.3 Work orders (`workshop/work-orders`)

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/workshop/work-orders` | query `WorkOrderQueryRequest` | `{ data, totalCount, page, pageSize }` | `200`, `401` |
| GET | `/workshop/work-orders/{id}` | - | `WorkOrderViewModel` | `200`, `404`, `401` |
| POST | `/workshop/work-orders` | `WorkOrderRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| PATCH | `/workshop/work-orders/{id}/status` | `WorkOrderStatusRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| PATCH | `/workshop/work-orders/{id}/assign-technician` | `AssignTechnicianRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/workshop/work-orders/{id}/services` | `WorkOrderServiceItemRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/workshop/work-orders/{id}/services/{workOrderServiceId}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/workshop/work-orders/{id}/parts` | `WorkOrderPartItemRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/workshop/work-orders/{id}/parts/{workOrderPartId}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/workshop/work-orders/{id}/pay` | `WorkOrderPaymentRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| POST | `/workshop/work-orders/{id}/feedback` | `WorkOrderFeedbackRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |

## 10) Reviews

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/reviews/cars/{carId}` | query `page`, `pageSize` | `{ data, totalCount }` | `200` |
| GET | `/reviews/cars/{carId}/stats` | - | stats object | `200` |
| GET | `/reviews/cars/detail/{reviewId}` | - | car review detail | `200`, `404` |
| POST | `/reviews/cars` | `CarReviewRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| DELETE | `/reviews/cars/{reviewId}` | - | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| POST | `/reviews/cars/{reviewId}/helpful` | `ReviewHelpfulRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| POST | `/reviews/cars/{reviewId}/report` | `ReviewReportRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| GET | `/reviews/admin/pending` | query `page`, `pageSize` | `{ data, totalCount }` | `200`, `401`, `403` |
| PUT | `/reviews/admin/{reviewId}/moderate` | `ModerateReviewRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| GET | `/reviews/services/technician/{technicianId}` | query `page`, `pageSize` | `{ data, totalCount }` | `200` |
| GET | `/reviews/services/location/{locationId}` | query `page`, `pageSize` | `{ data, totalCount }` | `200` |
| POST | `/reviews/services` | `ServiceReviewRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| POST | `/reviews/services/{reviewId}/respond` | `ServiceReviewRespondRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

## 11) Chat

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/chat/conversations` | query `page`, `pageSize` | `{ data, totalCount }` | `200`, `401` |
| GET | `/chat/conversations/staff` | query `page`, `pageSize`, `status` | `{ data, totalCount }` | `200`, `401`, `403` |
| GET | `/chat/conversations/{id}` | - | conversation detail | `200`, `404`, `401` |
| GET | `/chat/conversations/{id}/messages` | query `page`, `pageSize` | conversation + messages | `200`, `404`, `401` |
| POST | `/chat/conversations` | `CreateConversationRequest` (JSON) | `OperationResult` | `201`, `400`, `401`, `404`, `409`, `422` |
| PUT | `/chat/conversations/{id}/assign` | `AssignConversationRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| PUT | `/chat/conversations/{id}/close` | `CloseConversationRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| POST | `/chat/messages` | `SendMessageRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| PUT | `/chat/conversations/{id}/read` | - | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |

## 12) AI Chatbot

| Method | Path | Input / Payload | Response data | Status code |
|---|---|---|---|---|
| GET | `/ai/sessions` | query `page`, `pageSize` | `{ data, totalCount }` | `200`, `401` |
| GET | `/ai/sessions/{sessionId}` | - | session detail | `200`, `404`, `401` |
| GET | `/ai/sessions/{sessionId}/messages` | - | session + messages | `200`, `404`, `401` |
| POST | `/ai/sessions` | `CreateSessionRequest` (JSON) | create session result | `201`, `401` |
| PUT | `/ai/sessions/{sessionId}/rename` | `RenameSessionRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| DELETE | `/ai/sessions/{sessionId}` | - | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| POST | `/ai/chat` | `AIChatRequest` (JSON) | `OperationResult.data` (bot response) | `200`, `400`, `401` |
| POST | `/ai/messages/{messageId}/feedback` | `MessageFeedbackRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `404`, `409`, `422` |
| GET | `/ai/kb` | query (`page`, `pageSize`, `category`) | `{ data, totalCount }` | `200` |
| POST | `/ai/kb` | `KnowledgeBaseRequest` (JSON) | create KB result | `201`, `400`, `401`, `403` |
| PUT | `/ai/kb/{docId}` | `KnowledgeBaseRequest` (JSON) | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |
| DELETE | `/ai/kb/{docId}` | - | `OperationResult` | `200`, `400`, `401`, `403`, `404`, `409`, `422` |

---

## Ghi chú bổ sung

- Các endpoint dùng role-based `[Authorize(Roles = "...")]` có thể trả `403`.
- Với endpoint `[Authorize]` có thể trả `401` khi token không hợp lệ/hết hạn.
- Một số endpoint hiện trả `200` cho thao tác create/update thay vì `201/204` (giữ nguyên theo code hiện tại).
- DTO chi tiết nằm trong:
  - `Models/InputModel/**`
  - `Models/ViewModel/**`

# SoldCars API — tham chiếu Frontend

Tài liệu được sinh từ scan `Controllers`, `Models/InputModel`, `Models/ViewModel` trong repo. Khi code thay đổi, cập nhật file này hoặc dùng Swagger (`/swagger`) để đối chiếu.

**Payload & response theo từng feature:** [modules/README.md](./modules/README.md).

---

## 1. Quy ước chung

| Mục | Chi tiết |
|-----|----------|
| JSON | `Program.cs` dùng **camelCase** cho property (`PropertyNamingPolicy = JsonNamingPolicy.CamelCase`). |
| Ngoại lệ | `TokenResponse` (login / refresh) map sang **snake_case** qua `[JsonPropertyName]`: `access_token`, `refresh_token`, `expires_in`, `token_type`, `scope`. |
| Auth | Header `Authorization: Bearer <access_token>`. Role trong JWT (Customer, Admin, SuperAdmin, Staff, …). |
| Phân trang thường gặp | `{ data, totalCount, page, pageSize }` hoặc `{ Data, TotalCount, Page, PageSize }` — ASP.NET serialize thành camelCase. |
| Lỗi / kết quả chung | Nhiều endpoint trả `OperationResult`: `{ success, errorCode?, message?, data? }`. |

---

## 2. Auth — `auth`, `auth/admin`

| Method | Path | Auth | Body / Query |
|--------|------|------|----------------|
| POST | `/auth/login` | Không | JSON `LoginRequest`: `usernameOrPhoneOrEmail`, `password` |
| POST | `/auth/register` | Không | JSON `RegisterRequest`: `username`, `email`, `password` (≥6 ký tự) |
| POST | `/auth/verify-otp` | Không | JSON `VerifyOtpRequest`: `email`, `otpCode` (6 ký tự) |
| POST | `/auth/resend-otp` | Không | JSON `ResendOtpRequest`: `email` |
| POST | `/auth/logout` | Bearer | JSON `LogoutRequest?`: `refreshToken?` |
| POST | `/auth/refresh-token` | Không | JSON `RefreshTokenRequest`: `refreshToken` |
| GET | `/auth/login/google` | Không | Redirect OAuth |
| GET | `/auth/callback/google` | Không | HTML popup postMessage |
| GET | `/auth/login/facebook` | Không | Redirect OAuth |
| GET | `/auth/callback/facebook` | Không | HTML popup postMessage |
| POST | `/auth/admin/login` | Không | JSON `LoginAdminRequest`: `username`, `password` |
| POST | `/auth/admin/staff/create` | SuperAdmin | JSON `CreateStaffRequest` — xem `Models/InputModel/Auth/Admin/CreateStaffRequest.cs` |

**Response login / refresh:** `TokenResponse` → JSON: `access_token`, `refresh_token`, `expires_in`, `token_type`, `scope`.

---

## 3. User — `user`, `user/files`

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | `/user/detail?gmailOrUserName=` | Customer | User entity / profile |
| POST | `/user/update-profile` | Customer | **multipart/form-data** `UpdateUserProfilesInput` — ảnh, phone, address, … |
| PATCH | `/user/changepassword?passwordOld=&newPassword=&username=` | Customer | Query string |
| PATCH | `/user/forgetPassword?email=` | Không | Gửi OTP |
| POST | `/user/verifyOtpForPassword` | Không | JSON `VerifyOtpForPasswordRequest` |
| POST | `/user/resetPasswordWithTemp` | Không | JSON `ResetPasswordWithTempRequest` |
| POST | `/user/send-gmail-message` | Customer | JSON `GmailMessageRequest` |

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| POST | `/user/files/upload` | Không (hiện tại) | **multipart/form-data** field `file` → `{ url }` |

---

## 4. Đơn hàng & thanh toán — `orders/payment`

| Method | Path | Auth | Body / Query |
|--------|------|------|----------------|
| GET | `/orders/payment/orders?page=&pageSize=` | Admin, SuperAdmin, Staff | Danh sách đơn |
| GET | `/orders/payment/order/{orderNumber}` | Bearer | Chi tiết — `OperationResult` + `data`: `OrderViewModel` |
| GET | `/orders/payment/order/{orderNumber}/payment-info` | Bearer | Thông tin QR / chuyển khoản — `data`: `SepayPaymentInfo` (`qrImageUrl`, `transferContent`, `bankAccount`, `bankName`, `amount`, `orderNumber`, `expiredAt`, `signature`) |
| POST | `/orders/payment/order` | Customer | JSON `OrderInput` — xem mục 8 |
| POST | `/orders/payment/sepay-ipn` | Không (SePay server) | JSON `SepayWebhookPayload` — header `Authorization: Apikey {IPN_key}` |
| PATCH | `/orders/payment/order/{id}/status` | Admin, SuperAdmin, Staff | JSON `UpdateOrderStatusInput`: `status`, `notes?` |

**ViewModel đơn:** `Models/ViewModel/FeatureCore/Order/Order.cs` — `OrderViewModel`, `CreateOrderResult`.

---

## 5. Xe — `car`

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | `/car/detail?id=` | Không | Chi tiết xe (service) |
| POST | `/car/paging` | Bearer (optional theo logic) | Query `CarPagingRequest`: `pageIndex`, `pageSize`, `bodyCode`, `brandCode`, `priceFrom`, `priceTo` — body POST có thể rỗng; filter qua query |
| POST | `/car/create` | Admin, SuperAdmin | **multipart/form-data** `CarRequest` |
| PUT | `/car/edit?id=` | Admin, SuperAdmin | **multipart/form-data** `CarRequest` |
| GET | `/car/techSpec/detail?id=` | Không | |
| PATCH | `/car/techSpec/edit?id=` | Admin, SuperAdmin | JSON `CarDetailRequest` |
| POST | `/car/techSpec/create` | Admin, SuperAdmin | JSON `CarDetailRequest` |

DTO: `Models/InputModel/Common/Car/CarRequest.cs`, `CarPagingRequest.cs`, `CarDetailRequest.cs`.  
ViewModel: `Models/ViewModel/FeatureCore/Car/`.

---

## 6. Phụ kiện & danh mục — `accessory`, `category`

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | `/accessory/detail?accessoryId=` | Không | |
| GET | `/accessory/all` | Không | Query `AccessoriesPagingRequest` |
| POST | `/accessory/create` | Admin, SuperAdmin, Staff | **multipart** `AccessoriesRequest` |
| PUT | `/accessory/edit?id=` | Admin, SuperAdmin, Staff | **multipart** `AccessoriesRequest` |
| GET | `/category/all` | Không | |
| GET | `/category/detail?categoryId=` | Không | |
| POST | `/category/create` | Admin, SuperAdmin, Staff | JSON `CategoryRequest` |
| PUT | `/category/edit?id=` | Admin, SuperAdmin, Staff | JSON `CategoryRequest` |

ViewModel: `Models/ViewModel/FeatureCore/Accessories/`, `Category/`.

---

## 7. Dữ liệu chung — `common`

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | `/common/brands` | Không | |
| GET | `/common/brand_accessories` | Không | |
| POST | `/common/brand/create` | Admin, SuperAdmin | **multipart** `BrandRequest` |
| PATCH | `/common/brand/edit` | Admin, SuperAdmin | **multipart** `BrandRequest` |
| POST | `/common/brand_accessory/create` | Admin, SuperAdmin, Staff | **multipart** `BrandAccessoryRequest` |
| PATCH | `/common/brand_accessory/edit` | Admin, SuperAdmin, Staff | **multipart** `BrandAccessoryRequest` |
| GET | `/common/bodytypes` | Không | |
| POST | `/common/bodytype/create` | SuperAdmin, Admin | **multipart** `BodyCarRequest` |
| PUT | `/common/bodytype/update` | Admin, SuperAdmin | **multipart** `BodyCarUpdateRequest` |
| GET | `/common/location?ip=` | Không | |
| GET | `/common/locations` | Không | |

---

## 8. DTO đặt hàng (`OrderInput`)

`Models/InputModel/FeatureCore/Order/OrderInput.cs`

| Field | Type | Mô tả |
|-------|------|--------|
| orderType | string | `"CAR"` \| `"ACCESSORY"` \| `"MIXED"` |
| paymentMethod | string | `BANK_TRANSFER`, `CARD`, `NAPAS_BANK_TRANSFER`, … |
| isInstallment | bool | |
| installmentMonths | int? | |
| downPayment | decimal? | |
| deliveryAddress | string? | |
| notes | string? | |
| cars | OrderCarItem[] | `carID`, `discountAmount?` |
| accessories | OrderAccessoryItem[] | `accessoryID`, `quantity`, `discountAmount?` |

---

## 9. HR — `hr/*`

**Payroll** — `hr/payrolls` — **Authorize: Admin, SuperAdmin**

| Method | Path | Query / Body |
|--------|------|----------------|
| GET | `/hr/payrolls` | `page`, `pageSize`, `staffId?`, `period?` |
| GET | `/hr/payrolls/{id}` | |
| POST | `/hr/payrolls` | JSON `PayrollRequest` |
| PUT | `/hr/payrolls/{id}` | JSON `PayrollRequest` |
| PATCH | `/hr/payrolls/{id}/pay` | JSON `PayrollPaymentRequest` |
| DELETE | `/hr/payrolls/{id}` | |

**Skills** — `hr/skills`

| Method | Path | Auth |
|--------|------|------|
| GET | `/hr/skills`, `/hr/skills/{id}` | Không (public list) |
| POST | `/hr/skills` | Admin, SuperAdmin |
| PUT | `/hr/skills/{id}` | Admin, SuperAdmin |
| DELETE | `/hr/skills/{id}` | Admin, SuperAdmin |

Body: JSON `SkillRequest` (`skillCode`, `skillName`, `description?`, `category?`, `isActive`).

**Technician levels** — `hr/technician-levels`

| GET | public | POST/PUT/DELETE | Admin, SuperAdmin |

Body: `TechnicianLevelRequest` (`levelCode`, `levelName`, `baseSalary`, `hourlyRate`, `bonusPerJob?`, `displayOrder`).

**Technicians** — `hr/technicians`

| Method | Path | Auth ghi chú |
|--------|------|----------------|
| GET | `/hr/technicians` | `page`, `pageSize`, `available?` |
| GET | `/hr/technicians/available` | |
| GET | `/hr/technicians/{id}`, `/{id}/skills` | |
| GET | `/hr/technicians/{id}/performance` | Admin, SuperAdmin, Staff |
| POST | `/hr/technicians` | Admin, SuperAdmin — `TechnicianRequest` |
| PUT | `/hr/technicians/{id}` | Admin, SuperAdmin |
| DELETE | `/hr/technicians/{id}` | Admin, SuperAdmin |
| POST | `/hr/technicians/{id}/skills` | Admin, SuperAdmin — `AssignSkillRequest` |
| DELETE | `/hr/technicians/{id}/skills/{skillId}` | Admin, SuperAdmin |

---

## 10. Bảo hiểm — `insurance/*`

**Companies** — `insurance/companies`  
GET public. POST/PUT **multipart/form-data** `InsuranceCompanyRequest` (có `logo` file). DELETE: Admin, SuperAdmin.

**Packages** — `insurance/packages`  
GET `?companyId=`. POST/PUT JSON `InsurancePackageRequest` — Admin, SuperAdmin.

**Policies** — `insurance/policies` — **Authorize**

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/insurance/policies` | `page`, `pageSize`, `userId?`, `status?` |
| GET | `/insurance/policies/expiring` | `withinDays` — Admin, SuperAdmin, Staff |
| GET | `/insurance/policies/{id}` | |
| POST | `/insurance/policies` | **multipart** `InsurancePolicyRequest` (có `document?`) |
| PATCH | `/insurance/policies/{id}/cancel` | Admin, SuperAdmin, Staff |

**Claims** — `insurance/claims` — **Authorize**

| GET | phân trang `status?` |
| POST | JSON `InsuranceClaimRequest` |
| PATCH | `/insurance/claims/{id}/status` — Admin, SuperAdmin, Staff — `InsuranceClaimStatusRequest` |

---

## 11. Xưởng dịch vụ — `workshop/*`

**Customer vehicles** — `workshop/customer-vehicles` — **Authorize**

| GET | list, `/{id}`, `/{id}/maintenance-history` |
| POST | `CustomerVehicleRequest` |
| PUT | `/{id}` — `CustomerVehicleRequest` |
| PATCH | `/{id}/mileage` — `CustomerVehicleUpdateMileageRequest` (`currentMileage`) |
| DELETE | `/{id}` — Admin, SuperAdmin, Staff |

**Appointments** — `workshop/appointments`

| Method | Path | Auth |
|--------|------|------|
| GET | list (query `AppointmentQueryRequest`), `/{id}` | Bearer |
| POST | `AppointmentRequest` | Bearer |
| PUT | `/{id}/confirm` | Admin, SuperAdmin, Staff |
| PUT | `/{id}/cancel` | Bearer — body optional `AppointmentStatusRequest` (cancelReason) |
| PATCH | `/{id}/status` | Admin, SuperAdmin, Staff |
| POST | `/{id}/send-reminder` | Admin, SuperAdmin, Staff |

**Work orders** — `workshop/work-orders` — **Authorize**

| GET | query `WorkOrderQueryRequest` |
| POST | `WorkOrderRequest` — Admin, SuperAdmin, Staff |
| PATCH | `/{id}/status`, `/{id}/assign-technician` — Staff |
| POST | `/{id}/services`, `/{id}/parts`, `/{id}/pay` — Staff |
| DELETE | `/{id}/services/{workOrderServiceId}`, `/{id}/parts/{workOrderPartId}` — Staff |
| POST | `/{id}/feedback` — `WorkOrderFeedbackRequest` (authenticated user) |

Chi tiết body: `Models/InputModel/FeatureCore/Workshop/WorkOrderRequest.cs` (gồm `WorkOrderStatusRequest`, `AssignTechnicianRequest`, `WorkOrderServiceItemRequest`, `WorkOrderPartItemRequest`, `WorkOrderPaymentRequest`, `WorkOrderFeedbackRequest`, `WorkOrderQueryRequest`).

---

## 12. Phụ lục — ViewModel đã rà soát (JSON field = camelCase)

### HR (`Models/ViewModel/FeatureCore/HR/HRViewModels.cs`)

- `SkillViewModel`: skillID, skillCode, skillName, description, category, isActive  
- `TechnicianLevelViewModel`: levelID, levelCode, levelName, baseSalary, hourlyRate, bonusPerJob, displayOrder  
- `TechnicianViewModel`: technicianID, staffID, staffFullName, staffEmail, levelID, levelName, hireDate, yearsOfExperience, certifications, isAvailable, currentWorkload, totalJobsCompleted, averageRating, notes, isActive, skills[]  
- `TechnicianSkillViewModel`, `TechnicianPerformanceViewModel`, `PayrollViewModel` — xem file nguồn.

### Insurance (`Models/ViewModel/FeatureCore/Insurance/InsuranceViewModels.cs`)

- `InsuranceCompanyViewModel`, `InsurancePackageViewModel`, `InsurancePolicyViewModel`, `InsuranceClaimViewModel` — property tương ứng trong file (camelCase khi serialize).

### Workshop (`Models/ViewModel/FeatureCore/Workshop/WorkshopViewModels.cs`)

- `CustomerVehicleViewModel`, `AppointmentViewModel`, `AppointmentServiceViewModel`, `WorkOrderViewModel`, `WorkOrderServiceViewModel`, `WorkOrderPartViewModel`, `MaintenanceHistoryViewModel`.

---

## 13. Webhook SePay (IPN) — `SepayWebhookPayload`

Server-to-server; frontend thường không gọi. Tham chiếu: `Common/SepayConfig.cs` — các field JSON: `id`, `gateway`, `transactionDate`, `accountNumber`, `subAccount`, `code`, `content`, `transferType`, `transferAmount`, `accumulated`, `referenceCode`, `description`, `toBank`.

---

*Nếu thiếu endpoint hoặc field, mở Swagger hoặc file Controller/InputModel tương ứng trong repo.*

# Project Overview — SoldCars Web API

Tổng hợp toàn bộ thông tin dự án: kiến trúc, module, entity, service, cấu hình và tích hợp bên ngoài.

**Frontend React:** cửa vào tài liệu gọi API + UI — [FE-START.md](./FE-START.md).

---

## Thông tin chung

| Mục | Giá trị |
|-----|---------|
| **Tên dự án** | SoldCars Web API |
| **Framework** | ASP.NET Core 8.0 |
| **Ngôn ngữ** | C# (.NET 8, nullable enabled) |
| **ORM** | EF Core 9 (Npgsql — PostgreSQL) |
| **Database** | PostgreSQL (Supabase hoặc local) |
| **Cache** | Redis (StackExchange.Redis — Upstash) |
| **Media storage** | Cloudinary |
| **Email** | Gmail SMTP + Mailjet |
| **Push notification** | Firebase Admin SDK (FCM) |
| **Payment** | SePay |
| **Auth** | JWT Bearer + OAuth (Google, Facebook) |
| **Mapping** | AutoMapper 15 |
| **Docs** | Swagger / Swashbuckle |
| **Containerization** | Docker |

**Ports mặc định (local):** HTTP `5000`, HTTPS `7250`

---

## Tech Stack chi tiết

### NuGet packages chính

| Package | Phiên bản | Dùng cho |
|---------|-----------|---------|
| AutoMapper | 15.0.1 | Entity ↔ DTO mapping |
| CloudinaryDotNet | 1.28.0 | Upload ảnh/video |
| DotNetEnv | 3.2.0 | Đọc `.env.local` |
| FirebaseAdmin | 3.0.0 | FCM push notification |
| Google.Apis.Auth | 1.72.0 | Google OAuth |
| Google.Apis.Gmail.v1 | 1.70.0 | Gmail API |
| Mailjet.Api | 3.0.0 | Email giao dịch |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.10 | JWT auth |
| Microsoft.EntityFrameworkCore | 9.0.9 | ORM |
| Npgsql.EntityFrameworkCore.PostgreSQL | 9.0.4 | PostgreSQL provider |
| EFCore.NamingConventions | 9.0.0 | snake_case columns |
| StackExchange.Redis | 2.9.32 | Redis client |
| Swashbuckle.AspNetCore | 6.5.0 | Swagger UI |
| System.IdentityModel.Tokens.Jwt | 8.14.0 | JWT generation |
| MimeKit | 4.14.0 | Email MIME |

---

## Cấu trúc thư mục

```
Web/
├── Controllers/
│   ├── Auth/                          # AuthController, LoginAdminController
│   └── FeatureCore/
│       ├── AIBot/                     # AIChatController
│       ├── Accessory/                 # AccessoriesController, CategoryController
│       ├── BodyType/                  # BodyTypeController
│       ├── Brand/                     # BrandController
│       ├── Car/                       # CarController
│       ├── Chat/                      # ChatController
│       ├── HR/                        # PayrollController, SkillController,
│       │                              #   TechnicianController, TechnicianLevelController
│       ├── Insurance/                 # InsuranceClaimController, CompanyController,
│       │                              #   PackageController, PolicyController
│       ├── Location/
│       │   └── OrderPayment/          # OrderPaymentController
│       ├── Review/                    # ReviewController
│       ├── User/                      # UserController, FilesController
│       └── Workshop/                  # AppointmentController, CustomerVehicleController,
│                                      #   WorkOrderController
├── Services/
│   ├── Auth/                          # User, Admin, OTP, Email, RefreshToken, OAuth, TempPassword
│   ├── Common/                        # Redis, PlanPremium
│   ├── FeatureCore/                   # 26 feature services
│   └── OrderPayment/                  # OrderPaymentServices
├── Reponsities/                       # EF Entities (tên folder giữ nguyên)
│   ├── AIBot/                         # AIChatMessage, ChatSession, IntentDefinition, KnowledgeBase
│   ├── Audit/                         # NotificationLog, UserActivities
│   ├── Chat/                          # Conversation, ConversationMessage
│   ├── Core/                          # Accessories, Cars, Locations, PremiumPlans, Services, …
│   ├── HR/                            # Payroll, Skill, Technician, TechnicianLevel, TechnicianSkill
│   ├── Insurance/                     # InsuranceClaim, Company, Package, Policy
│   ├── Lookup/                        # AccessoryCategory, BodyType, Brand, BrandAccessory, CarStatus
│   ├── Orders/                        # OrderHeaders, OrderCarDetails, OrderAccessoryDetails
│   ├── Review/                        # CarReview, ReviewHelpfulVote, ReviewReport, ServiceReview
│   ├── Security/                      # Roles, Staff, Users
│   └── Service/                       # Appointment, CustomerVehicle, WorkOrder, WorkOrderPart, …
├── Models/
│   ├── InputModel/                    # Request DTOs theo category/feature
│   ├── ViewModel/                     # Response DTOs theo category/feature
│   ├── Tranfers/ProfileUser/          # OAuth profile DTOs (Google, Facebook)
│   └── SoldCarsDbContext.cs           # EF Core DbContext
├── Common/                            # Shared utilities (Validator, RedisKeys, …)
├── Middleware/                        # Exception handling, JWT blacklist
├── Migrations/                        # EF Core migrations
├── docs/                              # Tài liệu dự án (file này)
├── Properties/                        # launchSettings.json
├── Program.cs                         # App entry point & DI registration
├── Web.csproj                         # Project config & packages
├── appsettings.json                   # App configuration
├── .env.local                         # Local secrets (không commit)
└── Dockerfile                         # Docker build
```

---

## Modules & Controllers

### Auth — `/auth`, `/auth/admin`

| Controller | Endpoints chính |
|-----------|----------------|
| `AuthController` | Register, Login (JWT + OAuth), Verify OTP, Refresh Token, Logout, Reset Password |
| `LoginAdminController` | Admin/Staff login, đổi mật khẩu, SuperAdmin recovery |

Roles: `SuperAdmin`, `Admin`, `Staff`, `Customer`

---

### Brand, BodyType, Location — `/common`, `/location`

| Controller | Endpoints chính |
|-----------|----------------|
| `BrandController` | CRUD brand xe + upload logo |
| `BodyTypeController` | CRUD loại thân xe |
| `LocationController` | CRUD tỉnh/thành — dữ liệu địa lý |

---

### Car - `/cars`

| Controller | Endpoints chính |
|-----------|----------------|
| `CarController` | CRUD xe, paging/filter, upload ảnh/video, thông số kỹ thuật, trạng thái xe |

---

### Accessory & Category - `/accessories`, `/categories`

| Controller | Endpoints chính |
|-----------|----------------|
| `AccessoriesController` | CRUD phụ kiện + upload ảnh |
| `CategoryController` | CRUD danh mục phụ kiện |

---

### User & Files — `/user`, `/user/files`

| Controller | Endpoints chính |
|-----------|----------------|
| `UserController` | Xem profile, cập nhật, danh sách user (admin), FCM token |
| `FilesController` | Upload avatar, xem/xóa file của user |

---

### Order & Payment — `/orders/payment`

| Controller | Endpoints chính |
|-----------|----------------|
| `OrderPaymentController` | Tạo đơn hàng xe/phụ kiện, webhook SePay IPN, lịch sử đơn hàng |

---

### HR — `/hr`

| Controller | Endpoints chính |
|-----------|----------------|
| `TechnicianController` | CRUD kỹ thuật viên |
| `TechnicianLevelController` | CRUD cấp bậc kỹ thuật viên |
| `SkillController` | CRUD kỹ năng |
| `PayrollController` | CRUD bảng lương, tính lương theo tháng |

---

### Insurance — `/insurance`

| Controller | Endpoints chính |
|-----------|----------------|
| `InsuranceCompanyController` | CRUD công ty bảo hiểm |
| `InsurancePackageController` | CRUD gói bảo hiểm |
| `InsurancePolicyController` | CRUD hợp đồng bảo hiểm |
| `InsuranceClaimController` | CRUD yêu cầu bồi thường |

---

### Workshop — `/workshop`

| Controller | Endpoints chính |
|-----------|----------------|
| `CustomerVehicleController` | CRUD xe của khách hàng |
| `AppointmentController` | CRUD lịch hẹn bảo dưỡng |
| `WorkOrderController` | CRUD phiếu công việc (work order) |

---

### Review — `/reviews`

| Controller | Endpoints chính |
|-----------|----------------|
| `ReviewController` | Đánh giá xe + dịch vụ; vote helpful, report review |

---

### Chat — `/chat`

| Controller | Endpoints chính |
|-----------|----------------|
| `ChatController` | Tạo/lấy conversation, gửi/nhận message khách ↔ staff |

---

### AI Chatbot — `/ai`

| Controller | Endpoints chính |
|-----------|----------------|
| `AIChatController` | Chat với AI bot, lưu lịch sử session, intent detection |

---

## Entity Schemas (PostgreSQL)

| Schema | Folder | Các bảng chính |
|--------|--------|---------------|
| `Security` | `Reponsities/Security/` | Users, Staff, Roles |
| `Core` | `Reponsities/Core/` | Cars, Accessories, Locations, Services, PremiumPlans, UserPremium, CarTechnicalSpecs |
| `Lookup` | `Reponsities/Lookup/` | Brand, BodyType, BrandAccessory, AccessoryCategory, CarStatus |
| `Orders` | `Reponsities/Orders/` | OrderHeaders, OrderCarDetails, OrderAccessoryDetails |
| `Audit` | `Reponsities/Audit/` | UserActivities, NotificationLog |
| *(no schema)* | `Reponsities/HR/` | Payroll, Skill, Technician, TechnicianLevel, TechnicianSkill |
| *(no schema)* | `Reponsities/Insurance/` | InsuranceCompany, InsurancePackage, InsurancePolicy, InsuranceClaim |
| *(no schema)* | `Reponsities/Review/` | CarReview, ServiceReview, ReviewHelpfulVote, ReviewReport |
| *(no schema)* | `Reponsities/Service/` | Appointment, CustomerVehicle, WorkOrder, WorkOrderPart, WorkOrderService, MaintenanceHistory, AppointmentService |
| *(no schema)* | `Reponsities/Chat/` | Conversation, ConversationMessage |
| *(no schema)* | `Reponsities/AIBot/` | ChatSession, AIChatMessage, IntentDefinition, KnowledgeBase |

---

## Service Layer

### Auth Services (`Services/Auth/`)

| Service | Chức năng |
|---------|-----------|
| `UserService` | Register, login, OTP verify, profile, FCM token |
| `AdminAuthService` | Admin/Staff login, tạo staff |
| `SuperAdminGuardService` | SuperAdmin recovery password |
| `OAuthService` | Google / Facebook OAuth flow |
| `OtpService` | Sinh OTP, lưu Redis, verify |
| `EmailService` | Gửi email qua SMTP/Mailjet |
| `RefreshTokenService` | Cấp, rotate, revoke refresh token (Redis) |
| `TemporaryPasswordService` | Tạo và gửi mật khẩu tạm thời |

### Common Services (`Services/Common/`)

| Service | Chức năng |
|---------|-----------|
| `RedisService` | Get/Set/Delete cache, TTL management |
| `PlanPremiumServices` | Quản lý gói premium người dùng |

### Feature Services (`Services/FeatureCore/`)

| Service | Chức năng |
|---------|-----------|
| `BrandServices` | CRUD brand + upload logo Cloudinary |
| `BodyCarServices` | CRUD body type xe |
| `CarServices` | CRUD xe, paging, upload media |
| `CarDetailServices` | Thông số kỹ thuật xe |
| `CarStatusServices` | Trạng thái xe |
| `AcessoryServices` | CRUD phụ kiện + upload ảnh |
| `CategoryServices` | CRUD danh mục phụ kiện |
| `BrandAccessoryService` | Liên kết brand ↔ accessory |
| `LocationServices` | CRUD tỉnh/thành |
| `StorageService` | Upload/delete media lên Cloudinary |
| `NotificationService` | Gửi FCM push notification |
| `CarReviewServices` | Đánh giá xe |
| `ServiceReviewServices` | Đánh giá dịch vụ |
| `TechnicianServices` | CRUD kỹ thuật viên |
| `TechnicianLevelServices` | CRUD cấp bậc |
| `SkillServices` | CRUD kỹ năng |
| `PayrollServices` | CRUD bảng lương |
| `InsuranceCompanyServices` | CRUD công ty bảo hiểm |
| `InsurancePackageServices` | CRUD gói bảo hiểm |
| `InsurancePolicyServices` | CRUD hợp đồng bảo hiểm |
| `InsuranceClaimServices` | CRUD yêu cầu bồi thường |
| `CustomerVehicleServices` | CRUD xe khách hàng |
| `AppointmentServices` | CRUD lịch hẹn |
| `WorkOrderServices` | CRUD phiếu công việc |
| `ChatServices` | Conversation + messaging |
| `AIChatServices` | AI chatbot session + intent |

### Payment Services (`Services/OrderPayment/`)

| Service | Chức năng |
|---------|-----------|
| `OrderPaymentServices` | Tạo đơn hàng, xử lý SePay IPN webhook |

---

## Authentication & Security

### JWT Flow

```
Client → POST /auth/login → [UserService] → ký JWT (access_token 60 phút)
                                           → tạo refresh_token → lưu Redis
Client → POST /auth/refresh → [RefreshTokenService] → rotate token
Client → POST /auth/logout  → [RefreshTokenService] → blacklist JWT trong Redis
```

**JWT Claims:** `userId`, `email`, `role`, `jti` (unique ID để blacklist)

**Redis keys dùng cho auth:**

| Key pattern | TTL | Mục đích |
|-------------|-----|---------|
| `SoldCars:otp:{email}` | 5 phút | Mã OTP xác thực email |
| `SoldCars:refresh:{userId}:{jti}` | 7 ngày | Refresh token |
| `SoldCars:jwt:blacklist:{jti}` | Còn lại của token | Token đã logout |
| `SoldCars:temp-pwd:{userId}` | 24 giờ | Mật khẩu tạm thời |

### OAuth

- **Google:** `Microsoft.AspNetCore.Authentication.Google` + `Google.Apis.Auth`
- **Facebook:** `Microsoft.AspNetCore.Authentication.Facebook`
- Callback xử lý qua `OAuthService`, tự động tạo account nếu email chưa tồn tại

### Roles & Phân quyền

| Role | Quyền |
|------|-------|
| `SuperAdmin` | Quản lý staff, recovery password toàn hệ thống |
| `Admin` | CRUD nội dung, xe, phụ kiện, HR, bảo hiểm |
| `Staff` | Xem đơn hàng, hỗ trợ khách hàng |
| `Customer` | Đặt hàng, đánh giá, lịch hẹn, chat |

---

## Tích hợp bên ngoài

### Cloudinary (Media Storage)

- Upload ảnh (JPEG, PNG, WebP — max 10MB) và video (MP4, AVI, MOV — max 50MB)
- Service: `StorageService` → `IStorageService`
- Config keys: `Cloudinary:CloudName`, `Cloudinary:ApiKey`, `Cloudinary:ApiSecret`

### Firebase FCM (Push Notification)

- Config: biến môi trường `FIREBASE_CONFIG` (JSON service account)
- Service: `NotificationService` → `INotificationService`
- Lưu device token qua `PUT /user/fcm-token`

### Redis (Upstash)

- Config: `Redis:ConnectionString`
- Dùng cho: OTP, refresh token, JWT blacklist, temp password, general cache
- Key prefix toàn dự án: `SoldCars:`

### SePay (Payment Gateway)

- Webhook IPN: `POST /orders/payment/sepay-ipn`
- Config: `SePay:SecretKey`, `SePay:IPN_key`
- HttpClient đăng ký trong `Program.cs` với base URL SePay

### Email

- **Gmail SMTP:** config `SMTP:HOST/PORT/EMAIL/PASSWORD`
- **Mailjet:** backup provider, `Mailjet.Api`

---

## Cấu hình môi trường

### appsettings.json (cấu trúc key)

```
ConnectionStrings:DefaultConnection      # PostgreSQL connection string
Jwt:Key / Issuer / Audience[]
Google:ClientId / ClientSecret
Facebook:AppId / AppSecret
Cloudinary:CloudName / ApiKey / ApiSecret
Redis:ConnectionString
SMTP:HOST / PORT / EMAIL / PASSWORD / ENABLE_SSL / FROM_NAME
SePay:SecretKey / IPN_key
FIREBASE_CONFIG                          # JSON service account (1 dòng)
AllowedOrigins                           # CORS origins
```

### .env.local

File local override — không commit lên git. Được load bởi `DotNetEnv` trước khi app start.

---

## Middleware Pipeline

Thứ tự middleware trong `Program.cs`:

1. **DotNetEnv** — load `.env.local`
2. Firebase Admin SDK init
3. Exception handling middleware
4. HTTPS redirection
5. CORS
6. Swagger (dev only)
7. Authentication (JWT + OAuth)
8. Authorization
9. JWT Blacklist middleware — chặn token đã logout
10. Controllers

---

## Response Format chuẩn

### Write operations (POST/PUT/DELETE)

```json
{
  "success": true,
  "errorCode": null,
  "message": "Thao tác thành công",
  "data": { }
}
```

### Paginated list

```json
{
  "data": [ ],
  "totalCount": 100
}
```

### Error codes chuẩn

| ErrorCode | HTTP | Tình huống |
|-----------|------|-----------|
| `ValidationError` | 400 | Dữ liệu đầu vào sai |
| `NotFound` | 404 | Resource không tồn tại |
| `EmailExists` | 409 | Email đã đăng ký |
| `UsernameExists` | 409 | Username đã tồn tại |
| `PhoneExists` | 409 | SĐT đã tồn tại |
| `Unauthorized` | 401 | Không có quyền |
| `InvalidCredentials` | 401 | Sai thông tin đăng nhập |
| `FileTooLarge` | 400 | File vượt giới hạn |
| `InvalidFileType` | 400 | Định dạng file không hỗ trợ |
| `InternalError` | 500 | Lỗi server |

---

## File Upload Rules

| Loại | Giới hạn size | Định dạng |
|------|--------------|-----------|
| Ảnh xe / brand logo | 10 MB | JPEG, PNG, WebP |
| Video xe | 50 MB | MP4, AVI, MOV, MKV, WebM |
| Ảnh phụ kiện | 5 MB | JPEG, PNG, WebP |
| Avatar user | 10 MB | JPEG, PNG, WebP, GIF |

Endpoint upload dùng `Content-Type: multipart/form-data` với `[FromForm]`.

---

## Số liệu thống kê dự án

| Hạng mục | Số lượng |
|---------|---------|
| Controllers | 25 |
| Service pairs (interface + impl) | 31 |
| Entity classes (Reponsities) | 48 |
| Input Models (Request DTOs) | 40+ |
| View Models (Response DTOs) | 25+ |
| EF Migrations | xem `Migrations/` |
| NuGet packages | 22 |
| Docs files | 32 |

---

## Liên kết nhanh

| Tài liệu | Link |
|---------|------|
| API Modules (payload & response) | [api/modules/README.md](api/modules/README.md) |
| Endpoint map đầy đủ | [api/endpoint-status-map.md](api/endpoint-status-map.md) |
| Frontend API reference | [api/frontend-api-reference.md](api/frontend-api-reference.md) |
| Commands cheat sheet | [commands.md](commands.md) |
| Kiến trúc & tối ưu | [architecture/README.md](architecture/README.md) |
| Git commit convention | [git_commit/README.md](git_commit/README.md) |
| SePay React/Vite guide | [features/orders/sepay-react-vite.md](features/orders/sepay-react-vite.md) |

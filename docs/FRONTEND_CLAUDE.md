# CLAUDE.md — SoldCars Frontend (React + Vite + TypeScript)

## Mục tiêu

Xây dựng frontend **SoldCars** — hệ thống bán xe hơi gồm:
- **Trang khách hàng** (customer-facing): duyệt xe, mua xe, phụ kiện, đặt lịch hẹn, đánh giá, chat, AI chatbot
- **Trang quản trị admin** (`/admin/*`): CRUD toàn bộ dữ liệu, quản lý đơn hàng, HR, bảo hiểm, xưởng

**Backend API (đã deploy):** `https://web-7012.onrender.com`  
**Không có prefix `/api`** — path đúng như trong tài liệu.  
**Frontend deploy:** Firebase Hosting (tự triển khai riêng — không cần cấu hình deploy).

---

## Tech Stack bắt buộc

```
React 18 + Vite + TypeScript (strict mode)
React Router v6             — routing, nested routes, protected routes
TanStack Query v5           — server state, caching, pagination
Axios                       — HTTP client với interceptor
Zustand                     — client state (auth, cart, UI)
Tailwind CSS + shadcn/ui    — UI components
React Hook Form + Zod       — form validation
React Hot Toast             — notifications
Lucide React                — icons
Day.js                      — date formatting
```

Không dùng Redux, không dùng class components.

---

## Folder Structure

```
src/
├── api/
│   ├── axiosInstance.ts          # base config + interceptors
│   ├── auth.api.ts
│   ├── car.api.ts
│   ├── accessory.api.ts
│   ├── category.api.ts
│   ├── brand.api.ts
│   ├── bodytype.api.ts
│   ├── location.api.ts
│   ├── user.api.ts
│   ├── order.api.ts
│   ├── hr.api.ts
│   ├── insurance.api.ts
│   ├── workshop.api.ts
│   ├── review.api.ts
│   ├── chat.api.ts
│   └── ai-chat.api.ts
├── components/
│   ├── ui/                       # shadcn components (Button, Input, Dialog, …)
│   ├── layout/
│   │   ├── CustomerLayout.tsx    # Navbar + Footer
│   │   ├── AdminLayout.tsx       # Sidebar + Topbar
│   │   └── AuthLayout.tsx        # centered card
│   └── common/
│       ├── DataTable.tsx         # reusable table + pagination
│       ├── FileUpload.tsx        # single/multi image upload
│       ├── ConfirmDialog.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePagination.ts
│   └── useDebounce.ts
├── pages/
│   ├── customer/
│   │   ├── Home/
│   │   ├── Cars/                 # danh sách + filter
│   │   ├── CarDetail/            # chi tiết xe + thông số
│   │   ├── Accessories/
│   │   ├── AccessoryDetail/
│   │   ├── Cart/
│   │   ├── Orders/               # lịch sử đơn hàng
│   │   ├── OrderDetail/          # chi tiết + QR thanh toán
│   │   ├── Appointments/         # đặt lịch hẹn
│   │   ├── Profile/
│   │   ├── Reviews/
│   │   ├── Chat/
│   │   └── AiChat/
│   ├── admin/
│   │   ├── Dashboard/
│   │   ├── Cars/                 # CRUD xe
│   │   ├── Brands/
│   │   ├── BodyTypes/
│   │   ├── Accessories/
│   │   ├── Categories/
│   │   ├── Locations/
│   │   ├── Orders/
│   │   ├── Users/
│   │   ├── HR/
│   │   │   ├── Technicians/
│   │   │   ├── TechnicianLevels/
│   │   │   ├── Skills/
│   │   │   └── Payroll/
│   │   ├── Insurance/
│   │   │   ├── Companies/
│   │   │   ├── Packages/
│   │   │   ├── Policies/
│   │   │   └── Claims/
│   │   ├── Workshop/
│   │   │   ├── Appointments/
│   │   │   ├── CustomerVehicles/
│   │   │   └── WorkOrders/
│   │   ├── Reviews/
│   │   └── Staff/                # SuperAdmin only
│   └── auth/
│       ├── Login/
│       ├── Register/
│       ├── VerifyOtp/
│       ├── ForgotPassword/
│       └── AdminLogin/
├── stores/
│   ├── authStore.ts              # user, tokens, role
│   └── cartStore.ts              # giỏ hàng local
├── types/
│   ├── auth.types.ts
│   ├── car.types.ts
│   ├── accessory.types.ts
│   ├── order.types.ts
│   ├── hr.types.ts
│   ├── insurance.types.ts
│   ├── workshop.types.ts
│   ├── review.types.ts
│   ├── chat.types.ts
│   └── common.types.ts
├── utils/
│   ├── formatCurrency.ts         # VND formatting
│   ├── formatDate.ts
│   └── errorMessage.ts           # OperationResult error extraction
├── router/
│   └── index.tsx                 # tất cả routes
└── App.tsx
```

---

## Axios Instance & Interceptors

**File: `src/api/axiosInstance.ts`**

```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: 'https://web-7012.onrender.com',
  timeout: 30000,
})

// Request: đính kèm Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: auto refresh khi 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          'https://web-7012.onrender.com/auth/refresh-token',
          { refreshToken }
        )
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## Auth Store (Zustand)

**File: `src/stores/authStore.ts`**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: { id: number; username: string; email: string; fullName: string; role: string } | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: AuthState['user']) => void
  logout: () => void
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAdmin: () => ['Admin', 'SuperAdmin'].includes(get().user?.role ?? ''),
      isSuperAdmin: () => get().user?.role === 'SuperAdmin',
    }),
    { name: 'soldcars-auth' }
  )
)
```

---

## Router Config

**File: `src/router/index.tsx`**

Cấu hình React Router v6 với:

- `/` → `CustomerLayout` wrapper
  - `/` → `HomePage`
  - `/cars` → `CarsPage` (danh sách + filter)
  - `/cars/:id` → `CarDetailPage`
  - `/accessories` → `AccessoriesPage`
  - `/accessories/:id` → `AccessoryDetailPage`
  - `/cart` → `CartPage`
  - `/orders` → `OrdersPage` (cần đăng nhập)
  - `/orders/:orderNumber` → `OrderDetailPage`
  - `/appointments` → `AppointmentsPage` (cần đăng nhập)
  - `/profile` → `ProfilePage` (cần đăng nhập)
  - `/chat` → `ChatPage` (cần đăng nhập)
  - `/ai-chat` → `AiChatPage`

- `/auth/*` → `AuthLayout` wrapper
  - `/auth/login` → `LoginPage`
  - `/auth/register` → `RegisterPage`
  - `/auth/verify-otp` → `VerifyOtpPage`
  - `/auth/forgot-password` → `ForgotPasswordPage`
  - `/auth/admin/login` → `AdminLoginPage`

- `/admin/*` → `AdminLayout` wrapper — **ProtectedRoute(roles: Admin, SuperAdmin)**
  - `/admin` → redirect `/admin/dashboard`
  - `/admin/dashboard` → `DashboardPage`
  - `/admin/cars` → `AdminCarsPage`
  - `/admin/brands` → `AdminBrandsPage`
  - `/admin/body-types` → `AdminBodyTypesPage`
  - `/admin/accessories` → `AdminAccessoriesPage`
  - `/admin/categories` → `AdminCategoriesPage`
  - `/admin/locations` → `AdminLocationsPage`
  - `/admin/orders` → `AdminOrdersPage`
  - `/admin/users` → `AdminUsersPage`
  - `/admin/hr/technicians` → `TechniciansPage`
  - `/admin/hr/levels` → `TechnicianLevelsPage`
  - `/admin/hr/skills` → `SkillsPage`
  - `/admin/hr/payroll` → `PayrollPage`
  - `/admin/insurance/companies` → `InsuranceCompaniesPage`
  - `/admin/insurance/packages` → `InsurancePackagesPage`
  - `/admin/insurance/policies` → `InsurancePoliciesPage`
  - `/admin/insurance/claims` → `InsuranceClaimsPage`
  - `/admin/workshop/appointments` → `WorkshopAppointmentsPage`
  - `/admin/workshop/vehicles` → `CustomerVehiclesPage`
  - `/admin/workshop/work-orders` → `WorkOrdersPage`
  - `/admin/reviews` → `AdminReviewsPage`
  - `/admin/staff` → `StaffPage` — **SuperAdmin only**

---

## ProtectedRoute Component

```typescript
// src/components/common/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  children: React.ReactNode
  roles?: string[]   // nếu không truyền → chỉ cần đăng nhập
  redirectTo?: string
}

export default function ProtectedRoute({ children, roles, redirectTo = '/auth/login' }: Props) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={redirectTo} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}
```

---

## TypeScript Types

Tạo types khớp với response API (camelCase). Ví dụ chuẩn:

```typescript
// src/types/common.types.ts
export interface OperationResult<T = unknown> {
  success: boolean
  errorCode?: string | null
  message?: string | null
  data?: T | null
}

export interface PagedResponse<T> {
  data: T[]
  totalCount: number
}

export interface PagedResponseAlt<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
```

```typescript
// src/types/auth.types.ts
export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string         // role: Customer | Admin | SuperAdmin | Staff
}

export interface UserProfile {
  id: number
  username: string
  email: string
  fullName?: string
  phone?: string
  avatarPath?: string
  role: string
  isActive: boolean
}
```

---

## API Files — Patterns

Mỗi `*.api.ts` export typed async functions. Không dùng `any`.

```typescript
// Ví dụ: src/api/car.api.ts
import api from './axiosInstance'
import type { PagedResponse } from '@/types/common.types'
import type { Car, CarDetail, CarPagingParams } from '@/types/car.types'

export const carApi = {
  paging: (params: CarPagingParams) =>
    api.post<PagedResponse<Car>>('/car/paging', null, { params }),

  getById: (id: number) =>
    api.get<CarDetail>(`/car/detail`, { params: { id } }),

  create: (form: FormData) =>
    api.post('/car/create', form),

  update: (id: number, form: FormData) =>
    api.put(`/car/update/${id}`, form),

  delete: (id: number) =>
    api.delete(`/car/delete/${id}`),
}
```

---

## Modules — Yêu cầu UI & API chi tiết

### 1. Auth

**Trang `/auth/login`**
- Form: `usernameOrPhoneOrEmail` + `password`
- Nút "Đăng nhập Google" → mở popup `GET /auth/login/google`, lắng nghe `window.message`
- Nút "Đăng nhập Facebook" → tương tự
- Sau login: lưu `access_token`, `refresh_token`, decode JWT lấy `role` → lưu `authStore`
- Redirect: Customer → `/`, Admin/SuperAdmin → `/admin/dashboard`

**Trang `/auth/register`**
- Bước 1: form `username`, `email`, `password` → `POST /auth/register`
- Bước 2: tự chuyển sang `/auth/verify-otp?email=...`
- Trang OTP: 6 ô input số, tự focus tiếp theo, nút Resend (cooldown 60s)
- `POST /auth/verify-otp` → nhận token → đăng nhập luôn

**Trang `/auth/admin/login`**
- Form `username` + `password` → `POST /auth/admin/login`
- Response trả `{ fullName, token }` — lưu riêng, xác định role từ JWT decode
- Redirect `/admin/dashboard`

---

### 2. Trang chủ (`/`)

- Hero banner với CTA "Xem xe ngay"
- Section "Xe nổi bật": gọi `POST /car/paging?isFeature=true&pageSize=6`
- Section "Thương hiệu": gọi `GET /common/brands` → hiển thị logo dạng grid
- Section "Phụ kiện hot": gọi `GET /accessory/all?pageSize=6&sortBy=viewCount`

---

### 3. Danh sách xe (`/cars`)

**API:** `POST /car/paging` — params qua query string:
```
pageIndex, pageSize, bodyCode, brandCode, priceFrom, priceTo
```

**UI:**
- Sidebar filter: brand (dropdown), body type (radio), khoảng giá (range slider)
- Grid card xe: ảnh chính, tên, giá, năm, nhiên liệu, số km
- Pagination
- Skeleton loading khi fetch
- URL sync filter → dùng `useSearchParams`

---

### 4. Chi tiết xe (`/cars/:id`)

**API:** `GET /car/detail?id={id}`

**UI:**
- Gallery ảnh (lightbox nếu nhiều ảnh) + video embed nếu có `videoPath`
- Thông số kỹ thuật dạng bảng 2 cột
- Nút "Đặt mua" → tạo đơn `POST /orders/payment/create-order`
- Section đánh giá: gọi `GET /review/car/{carId}` → list + form thêm review (cần đăng nhập)

---

### 5. Phụ kiện (`/accessories`)

**API:** `GET /accessory/all` — params: `page`, `pageSize`, `categoryID`, `brandAccessoryID`, `priceFrom`, `priceTo`, `sortBy`

**UI:**
- Filter danh mục (tabs hoặc sidebar)
- Grid card: ảnh, tên, giá, tồn kho
- Nút "Thêm vào giỏ" → `cartStore`

**Chi tiết phụ kiện (`/accessories/:id`):**
- `GET /accessory/detail?accessoryId={id}`
- Mô tả, giá, nút mua

---

### 6. Giỏ hàng & Đặt hàng

**Cart** lưu local (Zustand persist). Hiển thị items, tổng tiền.

**Checkout → `POST /orders/payment/create-order`**

```typescript
// Payload (JSON)
{
  userID: number
  // xe
  carID?: number
  // phụ kiện
  accessories?: { accessoryID: number; quantity: number }[]
  paymentMethod: "SePay" | "Cash"
  notes?: string
}
```

**Response:** `OperationResult` với `data.orderNumber`

**Trang `/orders/:orderNumber`:**
- `GET /orders/payment/order/{orderNumber}` → hiển thị chi tiết
- Nếu chưa thanh toán: hiển thị QR từ `GET /orders/payment/order/{orderNumber}/payment-info`
- QR image + số tài khoản + nội dung chuyển khoản + countdown timer hết hạn

---

### 7. Profile (`/profile`)

**API:**
- `GET /user/profile` → hiển thị thông tin
- `PUT /user/profile` → cập nhật `fullName`, `phone`, `address`, `dateOfBirth`
- `PUT /user/avatar` → `multipart/form-data` — upload avatar

**UI:** form với preview avatar, nút save, section đổi mật khẩu riêng.

---

### 8. Đặt lịch hẹn (`/appointments`)

**API:**
- `GET /workshop/appointments?userId={id}` → danh sách lịch của tôi
- `POST /workshop/appointments` → tạo lịch hẹn mới

**Payload tạo lịch hẹn (`AppointmentRequest`):**
```typescript
{
  customerVehicleID: number
  appointmentDate: string     // ISO
  appointmentTime: string     // "HH:mm"
  serviceType: string         // "Maintenance" | "Repair" | "Inspection"
  description?: string
  estimatedDuration?: number  // phút
}
```

**UI:** form chọn xe (từ danh sách xe của user), date picker, time picker, loại dịch vụ.

---

### 9. Chat (`/chat`)

**API:**
- `GET /chat/conversations` → danh sách cuộc hội thoại
- `GET /chat/conversations/{id}/messages` → messages
- `POST /chat/messages` → gửi tin

**UI:**
- Sidebar danh sách conversation
- Khung chat với messages theo thời gian
- Input + nút gửi
- Tự scroll xuống tin mới nhất

---

### 10. AI Chatbot (`/ai-chat`)

**API:**
- `POST /ai-chat/chat` → `{ message: string, sessionId?: string }`
- Response: `{ reply: string, sessionId: string }`

**UI:**
- Floating button → mở chat panel
- Bubble chat (user trái, bot phải)
- Typing indicator khi đang chờ response

---

## Admin Dashboard

### Layout Admin

- **Sidebar** cố định bên trái, responsive (collapsible)
- **Topbar**: avatar, tên user, nút logout
- **Sidebar menu** theo role:
  - Admin + SuperAdmin thấy tất cả
  - SuperAdmin thêm mục "Quản lý Staff"

**Sidebar menu items:**
```
Dashboard
Quản lý xe
  ├─ Danh sách xe
  ├─ Thương hiệu
  └─ Loại thân xe
Phụ kiện
  ├─ Danh sách phụ kiện
  └─ Danh mục
Địa điểm
Đơn hàng
Người dùng
Nhân sự (HR)
  ├─ Kỹ thuật viên
  ├─ Cấp bậc
  ├─ Kỹ năng
  └─ Bảng lương
Bảo hiểm
  ├─ Công ty BH
  ├─ Gói BH
  ├─ Hợp đồng
  └─ Yêu cầu BT
Xưởng dịch vụ
  ├─ Lịch hẹn
  ├─ Xe khách hàng
  └─ Phiếu công việc
Đánh giá
[SuperAdmin] Quản lý Staff
```

---

### Pattern Admin CRUD (áp dụng cho mọi module)

Mỗi trang admin CRUD có:
1. **DataTable** với cột: ID, các trường chính, trạng thái (badge), ngày tạo, Actions (Edit / Delete)
2. **Thanh công cụ**: nút "+ Thêm mới", ô tìm kiếm, filter nếu cần
3. **Dialog/Sheet** (không navigate sang trang mới) để:
   - Tạo mới: form validate bằng React Hook Form + Zod
   - Chỉnh sửa: prefill form
4. **ConfirmDialog** trước khi xóa
5. Toast success/error sau mỗi mutation
6. Pagination (TanStack Query `keepPreviousData`)

```typescript
// Pattern TanStack Query cho admin list
const { data, isLoading } = useQuery({
  queryKey: ['admin-cars', page, pageSize, filter],
  queryFn: () => carApi.paging({ pageIndex: page, pageSize, ...filter }),
  placeholderData: keepPreviousData,
})

// Mutation tạo mới
const createMutation = useMutation({
  mutationFn: carApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    toast.success('Thêm thành công')
    closeDialog()
  },
  onError: (err) => toast.error(extractError(err)),
})
```

---

### Admin: Quản lý xe

**API:**
- List: `POST /car/paging` (admin thấy tất cả trạng thái)
- Tạo: `POST /car/create` — `multipart/form-data`
- Sửa: `PUT /car/update/{id}` — `multipart/form-data`
- Xóa: `DELETE /car/delete/{id}`

**Form tạo/sửa xe** (multipart):

| Field | Input type | Validation |
|-------|-----------|-----------|
| carName | text | required |
| carCode | text | required, ≤50 |
| vin | text | required |
| brandID | select (từ API brands) | required |
| bodyTypeID | select (từ API body types) | required |
| statusID | select (từ API car statuses) | required |
| locationID | select (từ API locations) | required |
| modelName | text | required |
| modelYear | number | 1900–2100 |
| condition | select: New/Used/Certified | required |
| price | number | required |
| salePrice | number | optional |
| color | text | |
| fuelType | select | |
| transmission | select | |
| engineSize | number | |
| seats, doors | number | |
| mileage | number | |
| shortDescription | textarea | |
| detailedDescription | rich text / textarea | |
| isFeature | checkbox | |
| images | FileUpload (multiple) | max 10MB each, JPEG/PNG/WebP |
| video | FileUpload (single) | max 50MB, MP4/AVI/MOV |

---

### Admin: Quản lý đơn hàng

**API:**
- List: `GET /orders/payment/orders?page=1&pageSize=20`
- Chi tiết: `GET /orders/payment/order/{orderNumber}`

**UI:**
- Bảng: orderNumber, loại đơn, tên khách, tổng tiền, trạng thái (badge màu), ngày tạo
- Click row → modal chi tiết đầy đủ
- Filter theo trạng thái (Pending/Paid/Cancelled)

---

### Admin: Quản lý người dùng

**API:**
- `GET /user/all?page=1&pageSize=20` — admin
- `PUT /user/toggle-active/{id}` — khóa/mở tài khoản

**UI:**
- Bảng: avatar, username, email, phone, role, isActive (toggle switch), ngày đăng ký
- Không xóa user, chỉ toggle active

---

### Admin: HR — Kỹ thuật viên

**API:** `/hr/technicians`
- GET `/hr/technicians?page=1&pageSize=20`
- GET `/hr/technicians/{id}`
- POST `/hr/technicians` — JSON `TechnicianRequest`
- PUT `/hr/technicians/{id}`
- DELETE `/hr/technicians/{id}`

**`TechnicianRequest`:**
```typescript
{
  techCode: string       // ≤20
  fullName: string       // ≤100
  email?: string
  phone?: string
  levelID: number        // select từ /hr/technician-levels
  hireDate: string       // ISO date
  specialization?: string
  isActive: boolean
}
```

**`TechnicianViewModel`:** technicianID, techCode, fullName, email, phone, levelName, levelCode, hireDate, specialization, isActive

---

### Admin: HR — Bảng lương

**API:** `/hr/payroll`
- GET `/hr/payroll?page=1&pageSize=20&month=&year=`
- POST `/hr/payroll` — JSON `PayrollRequest`
- PUT `/hr/payroll/{id}`
- DELETE `/hr/payroll/{id}`

**`PayrollRequest`:**
```typescript
{
  technicianID: number
  payPeriodMonth: number    // 1–12
  payPeriodYear: number
  baseSalary: number
  jobBonus?: number
  overtimeHours?: number
  overtimePay?: number
  deductions?: number
  notes?: string
}
```

---

### Admin: Bảo hiểm

**Luồng nghiệp vụ:** Company → Package → Policy (liên kết user + xe + package) → Claim (yêu cầu bồi thường)

**API base paths:**
- `/insurance/companies`
- `/insurance/packages`
- `/insurance/policies`
- `/insurance/claims`

Mỗi resource: `GET` list (paging), `GET` by id, `POST` create, `PUT` update, `DELETE`.

**InsurancePolicyRequest:**
```typescript
{
  policyNumber: string
  userID: number
  packageID: number
  vehicleID?: number        // CustomerVehicle
  startDate: string         // ISO
  endDate: string
  premiumAmount: number
  coverageAmount: number
  status: "Active" | "Expired" | "Cancelled"
}
```

**InsuranceClaimRequest:**
```typescript
{
  policyID: number
  claimDate: string
  incidentDate: string
  description: string
  claimAmount: number
  status: "Pending" | "Approved" | "Rejected"
}
```

---

### Admin: Xưởng dịch vụ

**Luồng:** CustomerVehicle → Appointment → WorkOrder → WorkOrderPart + WorkOrderService

**Xe khách hàng (`/workshop/customer-vehicles`):**
- Admin xem tất cả, filter theo `userId`
- Sửa mileage: `PATCH /workshop/customer-vehicles/{id}/mileage`
- Xem lịch sử bảo dưỡng: `GET /workshop/customer-vehicles/{id}/maintenance-history`

**Lịch hẹn (`/workshop/appointments`):**
- Bảng: khách hàng, xe, ngày/giờ, loại DV, trạng thái
- Cập nhật trạng thái: Pending → Confirmed → Completed / Cancelled

**Phiếu công việc (`/workshop/work-orders`):**
- Liên kết appointment
- Ghi nhận phụ tùng và dịch vụ thực hiện
- Tổng chi phí

---

### Admin: Đánh giá

**API:**
- `GET /review/car?page=1&pageSize=20` — list tất cả đánh giá xe
- `GET /review/service?page=1&pageSize=20` — đánh giá dịch vụ
- `DELETE /review/car/{id}` — xóa đánh giá vi phạm (Admin)
- `DELETE /review/service/{id}`

**UI:** bảng hiển thị rating (sao), nội dung, tên người đánh giá, ngày, trạng thái report

---

### Admin: Dashboard

Stats cards (gọi endpoint thống kê hoặc aggregate từ list APIs):
- Tổng xe đang bán
- Đơn hàng hôm nay
- Người dùng mới tuần này
- Doanh thu tháng

Charts (dùng Recharts):
- Line chart doanh thu 12 tháng
- Pie chart đơn hàng theo trạng thái
- Bar chart xe bán theo brand

---

## Common Components

### DataTable

```typescript
// props
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  toolbar?: React.ReactNode
}
```

### FileUpload

- Single: preview ảnh, replace khi chọn lại
- Multiple: grid preview, xóa từng ảnh
- Validate size + type ngay client trước khi upload
- Hiển thị progress bar trong mutation

---

## Xử lý lỗi thống nhất

```typescript
// src/utils/errorMessage.ts
import { AxiosError } from 'axios'

export function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (err.response?.status === 401) return 'Phiên đăng nhập hết hạn'
    if (err.response?.status === 403) return 'Không có quyền thực hiện'
    if (err.response?.status === 404) return 'Không tìm thấy dữ liệu'
    if (err.response?.status === 409) return data?.message ?? 'Dữ liệu đã tồn tại'
  }
  return 'Đã xảy ra lỗi, vui lòng thử lại'
}
```

---

## UI/UX Guidelines

- **Màu chủ đạo:** slate/blue tone (xe hơi — sang trọng, đáng tin)
- **Font:** Inter hoặc Geist (system font)
- **Dark mode:** hỗ trợ qua Tailwind `dark:` (optional nhưng nên có)
- **Responsive:** mobile-first; admin sidebar collapse trên mobile
- **Loading:** Skeleton thay vì spinner khi load dữ liệu bảng/card
- **Empty state:** ảnh/icon + message gợi ý hành động khi chưa có data
- **Form:** inline error message ngay dưới field, không dùng alert
- **Số tiền:** luôn format VND — `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- **Ngày:** `DD/MM/YYYY` — dùng `dayjs(date).format('DD/MM/YYYY')`
- **Image fallback:** nếu `imagePath` null → hiển thị placeholder xe

---

## Environment Variables

```env
# .env
VITE_API_BASE_URL=https://web-7012.onrender.com
```

Dùng `import.meta.env.VITE_API_BASE_URL` trong `axiosInstance.ts`.

---

## Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `CarCard.tsx`, `DataTable.tsx` |
| Hook | camelCase + `use` prefix | `useAuth.ts`, `usePagination.ts` |
| API file | camelCase + `.api` | `car.api.ts` |
| Type file | camelCase + `.types` | `car.types.ts` |
| Store | camelCase + `Store` | `authStore.ts` |
| Page folder | PascalCase | `CarDetail/index.tsx` |
| CSS class | Tailwind utility only | không viết CSS riêng |

---

## Checklist trước khi hoàn thành mỗi module

- [ ] API function có TypeScript return type rõ ràng
- [ ] Form validate bằng Zod schema
- [ ] Loading state khi fetch / submit
- [ ] Error state hiển thị message có nghĩa
- [ ] Empty state khi danh sách rỗng
- [ ] Responsive trên mobile (≥320px) và desktop
- [ ] Admin route được bảo vệ bởi `ProtectedRoute`
- [ ] Toast notification sau mỗi CUD operation
- [ ] Query invalidate sau mutation để data tự refresh
- [ ] File upload validate size + type trước khi gửi

---

## Tài liệu tham khảo (trong folder `docs/`)

| File | Nội dung |
|------|----------|
| `docs/api/modules/auth.md` | Payload/response auth đầy đủ |
| `docs/api/modules/car.md` | CRUD xe + paging params |
| `docs/api/modules/accessory-category.md` | Phụ kiện + danh mục |
| `docs/api/modules/common-catalog.md` | Brand, BodyType, Location |
| `docs/api/modules/orders-payment.md` | Đơn hàng + SePay QR |
| `docs/api/modules/user-profile.md` | Profile + file upload |
| `docs/api/modules/hr.md` | HR toàn bộ |
| `docs/api/modules/insurance.md` | Bảo hiểm toàn bộ |
| `docs/api/modules/workshop.md` | Xưởng dịch vụ |
| `docs/api/modules/review.md` | Đánh giá |
| `docs/api/modules/chat.md` | Chat |
| `docs/api/modules/ai-chatbot.md` | AI Chatbot |
| `docs/api/endpoint-status-map.md` | Map đầy đủ endpoint + status code |
| `docs/project-overview.md` | Tổng quan dự án backend |

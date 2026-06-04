# AI Toolkit — Project Config (SoldCar)

---

## 1. Project Identity

```
PROJECT_NAME=SoldCar
PROJECT_TYPE=web
DESCRIPTION=Marketplace mua bán xe ô tô, phụ kiện và dịch vụ. Tích hợp SePay payment và OAuth (Google/Facebook).
```

---

## 2. Tech Stack

### Frontend
```
FRAMEWORK=react
LANGUAGE=typescript
BUILD_TOOL=vite
STYLING=tailwind + styled-components
  TAILWIND_CUSTOM=no
ROUTING=react-router-v6
```

### State & Data
```
GLOBAL_STATE=zustand
  STORE_DIR=src/stores/              ← authStore, cartStore, uiStore
SERVER_STATE=react-query
HTTP_CLIENT=axios
  AXIOS_INSTANCE=src/services/api/index.ts  (export: apiClient — dùng cái này)
  AXIOS_LEGACY=src/services/api/axiosInstance.ts  (export: api — legacy, KHÔNG thêm mới)
FORM_LIB=react-hook-form
  VALIDATION=zod
```

### Auth
```
AUTH_STRATEGY=jwt + oauth (Google, Facebook)
TOKEN_STORAGE=localStorage
REFRESH_TOKEN=yes
MULTI_TENANT=no
```

---

## 3. Folder Structure

```
SRC_ROOT=src/

COMPONENTS_DIR=src/components/        ← common/, core/, layout/, payment/
PAGES_DIR=src/pages/                  ← admin/, customer/, auth/, account/, staff/
HOOKS_DIR=src/query/{resource}/       ← keys.ts + use{Resource}Queries.ts (pattern mới)
  HOOKS_LEGACY=src/shared/hooks/      ← một số resource cũ, không thêm vào đây
SERVICES_DIR=src/services/api/functions/
TYPES_DIR=src/shared/types/
  RESPONSE_TYPES=src/shared/types/Reponse/  ← "Reponse" typo cố ý, KHÔNG sửa
  REQUEST_TYPES=src/shared/types/Request/
STORE_DIR=src/stores/
ASSETS_DIR=src/assets/
```

### API Service pattern (quan trọng)
```
Mỗi resource có 2 file trong SERVICES_DIR/{Resource}/:
  Routes.ts       — constants: endpoint URL strings
  Routes.Fn.ts    — functions: axios calls (getList, getById, create, update, delete)

Ví dụ: src/services/api/functions/Cars/Routes.ts
                                        Routes.Fn.ts
```

### Hook pattern (quan trọng)
```
Mỗi resource có folder trong HOOKS_DIR/{resource}/
  keys.ts                    ← query keys factory
  use{Resource}Queries.ts    ← useQuery + useMutation hooks

Ví dụ: src/query/car/useCarQueries.ts
```

### Type pattern (quan trọng)
```
TYPES_DIR/Reponse/{Resource}/index.ts   — API response types   ← "Reponse" typo cố ý, KHÔNG sửa
TYPES_DIR/Request/{Resource}/index.ts   — Request payload types
```

---

## 4. API

```
API_BASE_URL=https://web-7012.onrender.com  (không có prefix /api)
API_STYLE=rest
RESPONSE_WRAPPER=yes
  WRAPPER_SHAPE={ success: boolean, message: string, data: T }  ← OperationResult<T>
  LIST_SHAPE={ data: T[], totalCount: number, page: number, pageSize: number }
PAGINATION_STYLE=page
  PAGE_SHAPE={ data: T[], totalCount: number, page: number, pageSize: number }
ERROR_FORMAT={ success: false, errorCode: string, message: string }
```

---

## 5. Testing

```
TEST_RUNNER=vitest
COMPONENT_TEST=@testing-library/react
E2E=none
MOCK_LIB=vi.mock
COVERAGE_THRESHOLD=70
TEST_COLOCATION=no
TEST_SUFFIX=.test.tsx
TEST_DIR=src/test/
```

---

## 6. Component Conventions

```
EXPORT_STYLE=named
COMPONENT_STYLE=function
PROPS_PATTERN=interface
MAX_COMPONENT_LINES=250
STORYBOOK=no
```

---

## 7. Domain Context

```
RESOURCES=
  Car           - Xe ô tô, có BrandCar (hãng) và BodyCar (loại thân xe)
  Accessory     - Phụ kiện xe, có BrandAccessory riêng
  Service       - Dịch vụ sửa chữa/bảo dưỡng xe
  Category      - Danh mục chung
  Location      - Tỉnh/thành phố, dùng cho filter
  Payment       - Thanh toán qua SePay (sandbox), có OrderDetail
  User          - Người dùng cuối
  Admin         - Quản trị viên (role: superadmin)
  Auth          - Xác thực: email/password + Google OAuth + Facebook OAuth

BUSINESS_RULES=
  - JWT token lưu localStorage, inject qua axios request interceptor (Bearer)
  - 401/400 token error → emit custom event 'unauthorized' → Redux clear auth
  - Superadmin route được bảo vệ riêng trong RootNavigation
  - OAuth dùng popup window + window.postMessage để nhận token
  - SePay sandbox: REACT_APP_SEPAY_BASE_URL, REACT_APP_SEPAY_SECRET_KEY
  - FormData request: axios tự set Content-Type multipart/form-data
  - Axios timeout: 10 giây
  - Tên folder: PascalCase cho resource (Car, Accessory, BrandCar, BodyCar...)
  - Tên file API: Routes.ts + Routes.Fn.ts (không dùng Route singular)
  - Query keys factory: export const {resource}Keys = { all, lists, list, detail }
```

---

## 8. Code Quality

```
LINTER=none
FORMATTER=none
COMMIT_CONVENTION=none
HUSKY=no
CI=none
```

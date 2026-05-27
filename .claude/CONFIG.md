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
GLOBAL_STATE=redux-toolkit
SERVER_STATE=react-query
HTTP_CLIENT=axios
  AXIOS_INSTANCE=src/services/api/index.ts
FORM_LIB=react-hook-form
  VALIDATION=yup (primary), zod (secondary)
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

COMPONENTS_DIR=src/shared/components/
PAGES_DIR=src/pages/
HOOKS_DIR=src/shared/hooks/
SERVICES_DIR=src/services/api/functions/
TYPES_DIR=src/shared/types/
STORE_DIR=src/redux/
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
Mỗi resource có folder trong HOOKS_DIR/{Resource}/index.ts
Dùng React Query với queryKeys factory pattern.

Ví dụ: src/shared/hooks/Car/index.ts
```

### Type pattern (quan trọng)
```
TYPES_DIR/Response/{Resource}/index.ts   — API response types
TYPES_DIR/Request/{Resource}/index.ts    — Request payload types

Lưu ý: Thư mục gốc là "Response" (không phải "Reponse" — typo cũ trong codebase)
```

---

## 4. API

```
API_BASE_URL=https://localhost:7250
API_STYLE=rest
RESPONSE_WRAPPER=no
PAGINATION_STYLE=page
  PAGE_SHAPE={ pageIndex: number, pageSize: number, totalCount: number, items: T[] }
ERROR_FORMAT={ message: string, statusCode: number }
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

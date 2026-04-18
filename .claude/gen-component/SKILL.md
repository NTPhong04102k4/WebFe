---
name: gen-component
description: Tạo UI component theo convention của project. Dùng khi cần tạo component mới, page, layout, hoặc feature module.
argument-hint: "[ComponentName] [type: component|page|layout|feature]"
disable-model-invocation: false
---

# Generate Component

Tạo component theo đúng convention của project hiện tại.

---

<!-- ═══════════════════════════════════════════════
     PROJECT CONFIG — SoldCar
     ═══════════════════════════════════════════════

PROJECT_NAME=SoldCar
FRAMEWORK=react
LANGUAGE=typescript
STYLING=tailwind + styled-components
  TAILWIND_CUSTOM=no
ROUTING=react-router-v6
GLOBAL_STATE=redux-toolkit
  AUTH_SELECTOR=useAppSelector(state => state.auth)
  DISPATCH_HOOK=useAppDispatch (từ src/redux/hook.ts)
FORM_LIB=react-hook-form
  VALIDATION=yup (primary)

COMPONENTS_DIR=src/shared/components/
PAGES_DIR=src/pages/
SHARED_DIR=src/shared/

EXPORT_STYLE=named
COMPONENT_STYLE=function
PROPS_PATTERN=interface
MAX_COMPONENT_LINES=250

RESOURCES=
  Car, BrandCar, BodyCar, Accessory, BrandAccessory
  Service, Category, Location, Payment, Auth, User (role: user | superadmin)

BUSINESS_RULES=
  - Page component đặt tại src/pages/{feature}/index.tsx
  - Sub-component đặt tại src/pages/{feature}/components/ hoặc src/shared/components/
  - Reusable component → src/shared/components/
  - Dùng useAppSelector/useAppDispatch (không import store trực tiếp)
  - Admin-only route: kiểm tra role superadmin từ Redux auth state
════════════════════════════════════════════════ -->

---

## Quy tắc tạo component

### Cấu trúc file
- Đặt file đúng folder dựa theo `type` argument: component → `COMPONENTS_DIR`, page → `PAGES_DIR`, feature → `FEATURES_DIR`
- Tên file: `PascalCase.tsx` (hoặc `.jsx` / `.vue` tùy LANGUAGE)
- Export theo `EXPORT_STYLE`

### TypeScript / Props
- Dùng `PROPS_PATTERN` (interface hoặc type) cho props
- Không dùng `any` — nếu type chưa rõ thì dùng `unknown` và comment `// TODO: type này`
- Props optional thì dùng `?`, kèm default value nếu có

### Styling
- Nếu `STYLING=tailwind` và `TAILWIND_CUSTOM=yes`: **chỉ dùng custom token** (`CUSTOM_TOKENS`), không hardcode màu Tailwind mặc định (`text-blue-500` v.v.)
- Nếu `STYLING=styled-components`: export styled component riêng, không inline
- Mobile-first nếu là web: `sm:` → `md:` → `lg:`
- Thêm `dark:` variant nếu project hỗ trợ dark mode

### State
- Local state: `useState`, `useReducer`
- Nếu cần global: dùng `GLOBAL_STATE` — không import store trực tiếp vào UI, tạo selector hook riêng
- Side effects trong `useEffect` phải có cleanup function

### Form (nếu component có form)
- Dùng `FORM_LIB` + `VALIDATION`
- Không dùng uncontrolled input trừ khi có lý do

### Accessibility
- Button phải có accessible label
- Img phải có `alt`
- Form input phải có `label` hoặc `aria-label`
- Interactive element phải focusable bằng keyboard

---

## Hướng dẫn thực hiện

1. Parse `$ARGUMENTS` → lấy tên component và type
2. Xác định folder đặt file dựa theo type
3. Tạo file với:
   - Props interface/type đầy đủ
   - JSX/template structure phù hợp
   - Styling đúng convention
   - Loading / empty / error state nếu component fetch data
4. Nếu component cần data → gợi ý hook tương ứng (dùng skill `gen-api`)
5. Nếu component > `MAX_COMPONENT_LINES` → tách thành sub-component

Tạo component: **$ARGUMENTS**

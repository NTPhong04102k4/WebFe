# CLAUDE.md — SoldCars Frontend (webapp/)

Đọc file này trước. Sau đó đọc `FRONTEND_CLAUDE.md` để lấy spec từng module (UI, API payload, router).

---

## Stack

```
React 18 + Vite + TypeScript (strict)
TanStack Query v5     — server state
Axios                 — HTTP client
Zustand               — client state (auth, cart, ui)
Tailwind + shadcn/ui  — UI
React Hook Form + Zod — form validation
React Hot Toast / notify — notifications
```

---

## Cấu trúc source thực tế

```
src/
├── services/
│   ├── api/
│   │   ├── index.ts                     ← apiClient (Axios instance + interceptors)
│   │   ├── endpoints/index.ts           ← API{} — source of truth tất cả HTTP paths
│   │   ├── functions/[Resource]/
│   │   │   ├── Routes.ts                ← re-export từ API.[resource]
│   │   │   └── Routes.Fn.ts             ← typed async functions gọi apiClient
│   │   ├── authSession.ts
│   │   └── requestOptions.ts
│   ├── storage/db/                      ← IndexedDB wrappers
│   └── types/common.types.ts            ← OperationResult<T>, PagedResponse<T>
├── stores/
│   ├── authStore.ts                     ← Zustand + persist (accessToken, user, role helpers)
│   ├── cartStore.ts                     ← Zustand + persist
│   ├── uiStore.ts                       ← Zustand (không persist)
│   └── persistStorage.ts               ← custom storage adapter
├── shared/
│   ├── types/
│   │   ├── Request/[Resource]/index.ts  ← Request payload types
│   │   └── Reponse/[Resource]/index.ts  ← Response types  ← "Reponse" typo cố ý, KHÔNG sửa
│   ├── hooks/                           ← legacy hooks (một số resource cũ — không thêm mới vào đây)
│   └── validation/                      ← Zod schemas
├── query/
│   ├── queryClient.ts                   ← QueryClient config
│   └── [resource]/                      ← TanStack Query hooks (pattern mới — thêm mới vào đây)
│       ├── keys.ts                      ← query keys factory
│       └── use[Resource]Queries.ts      ← useQuery + useMutation
├── hooks/                               ← utility hooks (useCartUserSync, useChatHub, useFcmToken)
├── pages/
│   ├── admin/                           ← admin pages
│   ├── customer/                        ← customer-facing pages
│   ├── auth/
│   ├── account/
│   └── staff/
├── components/
│   ├── common/                          ← DataTable, FileUpload, ConfirmDialog, LoadingSpinner…
│   ├── core/                            ← shared primitives (Feedback/toast, etc.)
│   ├── layout/                          ← CustomerLayout, AdminLayout, AuthLayout
│   └── payment/
├── config/environment.ts                ← ENV.API_URL
└── router/index.tsx
```

---

## Thêm resource API mới — pattern chuẩn

```typescript
// Bước 1: thêm vào src/services/api/endpoints/index.ts
export const API = {
  // ...existing...
  myResource: {
    list: "/my-resource",
    detail: (id: number) => `/my-resource/${id}`,
    create: "/my-resource",
    update: (id: number) => `/my-resource/${id}`,
    delete: (id: number) => `/my-resource/${id}`,
  },
}

// Bước 2: tạo src/services/api/functions/MyResource/Routes.ts
import { API } from "../../endpoints"
export const myResourceRoute = API.myResource

// Bước 3: tạo src/services/api/functions/MyResource/Routes.Fn.ts
import apiClient from "../.."
import { myResourceRoute } from "./Routes"
export const myResourceFn = {
  getList: async () => {
    const res = await apiClient.get(myResourceRoute.list)
    return res.data
  },
  getDetail: async (id: number) => {
    const res = await apiClient.get(myResourceRoute.detail(id))
    return res.data
  },
}

// Bước 4a: tạo src/query/myResource/keys.ts
export const myResourceKeys = {
  all: ["myResource"] as const,
  lists: () => [...myResourceKeys.all, "list"] as const,
  detail: (id: number) => [...myResourceKeys.all, "detail", id] as const,
}

// Bước 4b: tạo src/query/myResource/useMyResourceQueries.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { myResourceFn } from "@/services/api/functions/MyResource/Routes.Fn"
import { myResourceKeys } from "./keys"

export function useMyResourceList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: myResourceKeys.lists(),
    queryFn: ({ signal }) => myResourceFn.getList(params, { signal }),
    placeholderData: keepPreviousData,
  })
}

export function useMyResourceMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: myResourceKeys.lists() })
  return {
    create: useMutation({ mutationFn: myResourceFn.create, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: myResourceFn.delete, onSuccess: invalidate }),
  }
}
```

---

## Axios — 2 instances, KHÔNG nhầm

| Instance | Import | File | Dùng khi |
|----------|--------|------|---------|
| `apiClient` | `import apiClient from "@/services/api"` | `src/services/api/index.ts` | **Tất cả** functions trong `api/functions/` |
| `api` | `import api from "@/services/api/axiosInstance"` | `src/services/api/axiosInstance.ts` | **Legacy** — không thêm mới |

Cả 2 đều có interceptor. Khi tạo resource mới: **chỉ dùng `apiClient`**.

---

## Axios interceptors — đã xử lý sẵn

| Tình huống | Interceptor làm | Component cần làm |
|-----------|----------------|------------------|
| Đính token | Request interceptor tự gắn `Bearer` từ `authStore` | Không làm gì |
| `FormData` upload | Tự xóa `Content-Type` header | Chỉ cần truyền `FormData` |
| `success: false` từ API | Tự gọi `notify.error(message)` + reject | **Không gọi thêm** `notify.error` |
| 401 + token expired | Dispatch `auth:unauthorized` → redirect login | Không làm gì |
| Lỗi server khác | Tự gọi `notify.error(message)` nếu có message | **Không gọi thêm** |

**Anti-pattern cần tránh:**
```typescript
// SAI — toast hiện 2 lần
onError: (err) => notify.error(extractError(err))  // interceptor đã toast rồi!

// ĐÚNG — để interceptor tự xử lý
onError: () => {}  // hoặc xử lý state riêng, không toast thêm
```

---

## Zustand stores

```typescript
// authStore — đọc state
const { user, accessToken } = useAuthStore()
const isAdmin = useAuthStore(s => s.isAdmin())

// authStore — gọi action
useAuthStore.getState().setTokens(access, refresh)
useAuthStore.getState().logout()
```

---

## Component rules

- **Không viết raw HTML** cho modal, table, input, select, spinner, empty state — dùng component trong `src/components/`
- Admin CRUD: dùng `DataTable` + `Dialog`/`Sheet` (không navigate sang trang mới)
- Toast: chỉ gọi `notify.success()` sau mutation thành công — KHÔNG gọi `notify.error()` (interceptor đã làm)
- Form: React Hook Form + Zod schema, inline error ngay dưới field
- Format tiền: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Format ngày: `dayjs(date).format('DD/MM/YYYY')`

---

## Skills có sẵn (dùng `/skill-name`)

| Skill | Trigger khi |
|-------|------------|
| `/new-resource` | Scaffold API layer mới (endpoints + Routes + Routes.Fn) |
| `/fix-api` | Fix sai pattern trong API layer |
| `/fix-component` | Thay raw HTML bằng component có sẵn |
| `/fix-toast` | Xóa double-toast (component + interceptor) |
| `/refactor-profile` | Refactor Profile component |

---

## Domain spec

Xem `FRONTEND_CLAUDE.md` để lấy:
- Spec từng module: Auth, Cars, Accessories, Orders, HR, Insurance, Workshop, Chat, AI
- Router config đầy đủ
- Admin CRUD pattern
- Component `DataTable`, `FileUpload` props interface

<!-- skillrunner:begin (managed by `sr bootstrap` — do not edit inside) -->
## skillrunner (`sr`) — use it every session

This project (stack: **react**) is served by `sr` (aka `skillrunner`), a central
skill dispatcher on your PATH. It detects the stack and prints "marching orders"
(rules + steps) for YOU (Claude) to execute — it never reasons or edits files itself.

When a request matches a skill:
1. `sr status` — stack + whether docs/project-profile.md and docs/module-registry.md are cached.
2. `sr list` — skills with one-line descriptions; map the task to the right one.
3. `sr emit <skill>` — print the marching orders, then READ and FOLLOW the "Rules you MUST follow" section.
4. A skill tagged `[needs approval]` → only propose a plan/goal and STOP for the user; do not edit files first.
5. First task in a project with no docs/project-profile.md → run `learn-project` before implementing.

If a task clearly matches a skill, prefer `sr emit <skill>` over improvising.
<!-- skillrunner:end -->

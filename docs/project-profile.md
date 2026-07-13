# Project Profile — SoldCars / myDA WebFe

> Cached architecture profile built by `learn-project` on 2026-07-13. Reuse this for orientation;
> cheaply confirm a specific file/symbol still exists before relying on it. Rebuild only when the
> user explicitly asks to update it. Do **not** modify source code from this doc.

Root: `/Users/ghmsoft/Documents/Personal/myDA/WebFe` · Git branch at profile time: `feat/auth`

---

## 1. Framework & language

- **React 18.3** + **Vite 4.5** + **TypeScript 5.9** (`strict: true`, `noUnusedLocals`, `noEmit`).
- Path aliases: both `@/*` and `src/*` → `src/*` (tsconfig + `vite-tsconfig-paths`).
- **Server state:** TanStack Query v5. **Client state:** Zustand v5 (persist). **HTTP:** Axios 1.7.
- **UI:** Tailwind 3.4 + a **hand-built primitive library** (`src/components/core/`). There is **no `shadcn/ui` and no Radix** in this repo despite the stack blurb in CLAUDE.md.
- **Forms:** React Hook Form 7 + `@hookform/resolvers`. **Validation schemas are written in `yup`**, not Zod (Zod is installed but the schemas in `src/shared/validation/` use `yup`).
- **Toast:** `react-hot-toast` (wrapped by `notify`).
- Other notable deps: `@microsoft/signalr` (chat hub), `firebase` (FCM push), `chart.js`+`react-chartjs-2` (dashboards), `leaflet`/`react-leaflet`, `dayjs`, `crypto-js`, `xlsx`, `tinymce`.
- Scripts: `dev` (vite), `build`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `deploy` (build + `firebase deploy`).

---

## 2. Architecture & layers (data flow)

```
endpoints/index.ts (API{} — all HTTP paths)
  → functions/<Resource>/Routes.ts        (re-export API slice, e.g. carRoute = API.car)
  → functions/<Resource>/Routes.Fn.ts      (async fns: apiClient.get(route, withSignal({}, opts)) → unwrapData(res.data))
  → query/<resource>/useXxxQueries.ts       (useQuery / useMutation; threads {signal}; onSuccess invalidates keys)
  → page/component                          (receives already-unwrapped domain data)
```

- **`OperationResult<T>` envelope is unwrapped in the Routes.Fn layer**, not in the hook. Each `Routes.Fn.ts` has a local `unwrapData<T>()` (checks `"success" in payload && "data" in payload`, returns `.data`). Paged endpoints read `res.data.data` and return `{ data, totalCount }`. Query hooks handle caching/keys/signal/invalidation only.
- **Two Routes-function conventions coexist:**
  - Canonical (SoldCar): `Routes.ts` + `Routes.Fn.ts` (e.g. `functions/Cars/`). **Use this for new resources.**
  - Newer variant: `<resource>.api.ts` + `<resource>.types.ts` (e.g. `functions/serviceCatalog/`) — imports `API` directly, uses a local `compactParams`, returns `res.data` relying on wrapper-aware types.

Key files:
- `src/services/api/index.ts` — `apiClient` (primary). `src/services/api/endpoints/index.ts` — `API` object.
- `src/services/types/common.types.ts` — result types (below).
- `src/services/api/requestOptions.ts` — `ApiRequestOptions = { signal? }` + `withSignal(config, opts)` (wires React Query cancellation).
- `src/services/api/authSession.ts` — shared auth-header + session-cleanup helpers.

### Result types (`src/services/types/common.types.ts`)
```ts
interface OperationResult<T = unknown> { success: boolean; errorCode?: string|null; message?: string|null; data?: T|null }
interface PagedResponse<T>     { data: T[]; totalCount: number }
interface PagedResponseAlt<T>  { items: T[]; totalCount; page; pageSize; totalPages }
interface PagedResponseFull<T> { data: T[]; totalCount; page; pageSize }
```

---

## 3. Axios — TWO instances (do not confuse)

| | `apiClient` (**use for new code**) | `api` (legacy, do not extend) |
|---|---|---|
| Import | `import apiClient from "@/services/api"` | `import api from "@/services/api/axiosInstance"` |
| File | `src/services/api/index.ts` | `src/services/api/axiosInstance.ts` |
| baseURL | `ENV.API_URL` (no fallback) | `VITE_API_BASE_URL ?? "https://web-7012.onrender.com"` |
| timeout | 10000 ms | 30000 ms |
| paramsSerializer | `{ indexes: null }` (repeated keys for ASP.NET binding) | none |
| Toast opt-out flag | **`suppressErrorHandling`** | **`suppressErrorToast`** |
| Token refresh | ❌ none | ✅ POSTs `/auth/refresh-token`, retries original |

**`apiClient` interceptors (already handled — components must NOT duplicate):**
- **Request:** attaches `Bearer` from `useAuthStore.getState().accessToken`; deletes `Content-Type` when `config.data instanceof FormData` (browser sets multipart boundary).
- **Response success:** a `200` body with `success === false && message` → `notify.error(message)` **and** rejects the promise (unless `suppressErrorHandling`). Returns the full `response` (does NOT strip `.data`).
- **Response error:** 401 → if `!token || isTokenExpired(token)` and path not a login route, dispatches `window` event `auth:unauthorized` (a listener in `App.tsx` handles logout+redirect). Other errors with a server `message` → `notify.error` (unless suppressed). Always rejects.

Anti-pattern (see `/fix-toast`): interceptor already toasts API errors → **never call `notify.error` in a mutation `onError`.** Only call `notify.success` after success.

---

## 4. Zustand stores (`src/stores/`)

- **`authStore.ts`** — `useAuthStore`, persisted (`persist`, name `"soldcars-auth"`, localStorage, v2). State: `accessToken`, `refreshToken`, `user: AuthUser|null`. Actions: `setTokens(access, refresh)` (decodes token → user, sets global header), `setUser`, `clearUser`, `logout` (clears query cache + session side-effects). Role helpers: `isAdmin()` (Admin/SuperAdmin), `isSuperAdmin()`, `isStaff()`. Types in `src/services/types/auth.types.ts` (`AuthRole = "Customer"|"Admin"|"SuperAdmin"|"Staff"|string`).
  - Read: `const { user, accessToken } = useAuthStore()` · `useAuthStore(s => s.isAdmin())`
  - Act: `useAuthStore.getState().setTokens(a, r)` · `useAuthStore.getState().logout()`
- **`cartStore.ts`** — `useCartStore`, persisted to **IndexedDB** (per-user key `soldcars-cart-<userId>`/`-guest`, `skipHydration`). `items: CartItem[]` (car qty capped at 1). Selectors: `checkoutPayload()`, `totalCount()`, `totalPrice()`. `switchCartUser(userId)` swaps the IDB key. Prefer the `useCart` hook (below) over the raw store.
- **`uiStore.ts`** — `useUiPreferenceStore` (persist localStorage: `theme`, `language` + theme helpers `resolveAppTheme`/`applyAppTheme`/`subscribeToAppTheme`) and `useUiSessionStore` (sessionStorage: `adminSidebarCollapsed`).
- **`persistStorage.ts`** — `localPersistStorage` / `sessionPersistStorage` with in-memory fallback.
- Also present: `unsavedChangesStore.ts`.

---

## 5. Query layer (`src/query/`)

- **`queryClient.ts`** — singleton `appQueryClient` (`refetchOnWindowFocus:false`, `retry:1`, `staleTime:5min`, `gcTime:10min`). Constants `SEARCH_STALE_MS=30_000`, `LIST_STALE_MS=5*60_000`. `clearAppQueryCache()` (called by `authStore.logout`).
- **Resource subfolders:** accessory, ai, auth, body-type, brand-accessory, brand-car, broadcast, car, cart, category, finance, hr, insurance, location, order, payment, premium, review, service-catalog, service-category, staff, user, workshop.
- **Keys factory** (`<resource>/keys.ts`) — hierarchical const tuples:
  ```ts
  export const carKeys = {
    all: ["cars"] as const,
    lists: () => [...carKeys.all, "list"] as const,
    list: (params) => [...carKeys.lists(), params] as const,
    details: () => [...carKeys.all, "detail"] as const,
    detail: (id) => [...carKeys.details(), id] as const,
  }
  ```
- **Hooks** (`<resource>/useXxxQueries.ts`) — queries: `queryFn: ({ signal }) => routeFn.getPaging(params, { signal })`, `placeholderData: keepPreviousData`, `staleTime: SEARCH_STALE_MS`, `enabled: id != null` for detail. Mutations grouped in one hook, e.g. `useCarMutations()` → `{ createCar, updateCar, deleteCar }`; `onSuccess` invalidates via `useQueryClient()` (`create`/`delete` → `lists()`; `update` → `detail(id)` + `lists()`). **Put every query param into the queryKey** to avoid stale results.

Adding a resource: see the step-by-step in `CLAUDE.md` (endpoints → Routes → Routes.Fn → keys → useXxxQueries) or run `/new-resource`.

---

## 6. Routing & auth guard (`src/router/index.tsx`)

Single-file React Router v6 `<Routes>`, one top-level `<Suspense>` (fallback = `LoadingSpinner`); nearly all pages `React.lazy`. Layouts: `CustomerLayout`, `AdminLayout`, `AuthLayout` (from `@/components/layout/`), `AccountLayout` (eager, `@/pages/account`).

Route groups:
- **Customer** (`/`, `CustomerLayout`): public — home, cars, cars/:id, accessories, accessories/:id, cart, services, ai-chat, premium. Login-gated (each wrapped in `<ProtectedRoute>`) — orders, orders/:orderNumber, appointments, profile, reviews/:carId, chat, premium/history.
- **Account** (`/account`, whole layout `<ProtectedRoute>`): garage, orders, appointments, work-orders, insurance, reviews.
- **Auth** (`/auth`, `AuthLayout`, unguarded): login, register, verify-otp, forgot-password, reset-password, admin/login, callback (OAuth).
- **Admin** (`/admin`, `AdminLayout` `<ProtectedRoute roles={['Admin','SuperAdmin','Staff']} redirectTo="/auth/admin/login">`): dashboard, cars, brands, body-types, accessories, categories, locations, orders, users, premium-plans, subscriptions, support, car-inquiries, finance, broadcast, reviews, and nested **HR/Insurance/Workshop/Staff**. Sensitive children add a tighter guard: hr/*, insurance/*, reviews, finance, broadcast → `roles={['Admin','SuperAdmin']}`; staff → `roles={['SuperAdmin']}`.
- Catch-all `*` → `/`.

**Guard — `src/components/common/ProtectedRoute.tsx`:** reads token/user from `useAuthStore`; if no token/user or `isTokenExpired` → logout (if expired) + `<Navigate to={redirectTo}>`. Extracts roles from JWT (`getRolesFromToken`, fallback `getUserRoles`); role helpers/constants in `src/common/utils/roles.ts` (`ROLE`, `canAccessStaffBackend`, `getDefaultRouteForRoles`, etc.). Also present: `src/components/routing/{RequireAuth,StaffRoute}.tsx`.

---

## 7. App bootstrap

- **Active entry: `src/main.tsx`** — `subscribeToAppTheme()`; registers `firebase-messaging-sw.js`; handles `vite:preloadError`. Provider order: `StrictMode` → `ErrorBoundary` (`@/shared/components/ErrorBoundary`) → `QueryClientProvider` (`appQueryClient`) → `AppProviders` (Auth+Language) → `BrowserRouter` → `App`.
- `src/index.tsx` is a legacy CRA-style entry (no ErrorBoundary/SW), appears superseded.
- **`src/App.tsx`** — calls `useCartUserSync()` + `useFcmToken()`; listens for `auth:unauthorized` → `logout()` + navigate to `/auth/admin/login` or `/auth/login`; renders `<AppRouter />` + `<Toaster position="top-right" />`.
- **Contexts** (`src/contexts/`): `AppProviders` composes `AuthProvider` → `LanguageProvider`. `AuthContext` is a thin wrapper over `useAuthStore` (state lives in Zustand). `LanguageContext` wraps `useUiPreferenceStore`.

---

## 8. Top-level hooks (`src/hooks/`)

- **`useCart.ts`** — unified cart: Customer role → server-first Redis cart API (live prices, cross-device); guest/others → local IndexedDB via `cartStore`. Exposes add/remove/updateQuantity, `totalCount`, `isInCart`. **Prefer this over `cartStore` directly.**
- **`useCartUserSync.ts`** — mounted once at root; on user change swaps IDB cart key (`switchCartUser`) and merges guest→server on Customer login.
- **`useChatHub.ts`** — SignalR hub `${VITE_API_BASE_URL}/chathub`, JWT `accessTokenFactory`, auto-reconnect; wires NewMessage/ConversationUpdated/Assignment*/MessagePinned → query invalidations; Join/Leave conversation & staff-inbox groups.
- **`useFcmToken.ts`** — Firebase FCM (Customer only): permission → token (VAPID) → register to backend → foreground `onMessage` toasts. Config in `src/config/firebase.ts` (project `lazynerdcarweb`); background handler = `public/firebase-messaging-sw.js`.

---

## 9. Reusable component catalog

> No `src/components/ui/` (no shadcn). Primitives are hand-rolled under `src/components/core/` (barrel `core/index.ts`; helper `cn` in `core/utils.ts`). Common rules: **don't write raw HTML** for modal/table/input/select/spinner/empty state — use these.

### `src/components/core/`
| Component | Path | Purpose / key props |
|---|---|---|
| **DataTable**`<TData>` | `core/Table/DataTable.tsx` | TanStack-table wrapper (sort, optional pagination, dnd row reorder, loading/empty). Props: `data`, `columns: ColumnDef[]`, `getRowId?`, `loading?`, `emptyTitle?`/`emptyDescription?`, `enableSorting?`(true), `enablePagination?`(false), `initialPageSize?`(10), `onRowClick?`, `onRowOrderChange?`. |
| **notify** | `core/Feedback/toast.ts` | Toast helper. `success`(green 2s), `error`(red 3s), `info`(blue 2.5s), `loading`, `dismiss`. |
| **Loading** | `core/Feedback/Loading.tsx` | Inline spinner. `label?`, `className?`. |
| **EmptyState** | `core/Feedback/EmptyState.tsx` | `title?`, `description?`, `action?`. |
| **Input** | `core/Form/Input.tsx` | forwardRef input; native attrs + `label?`, `error?`, `helperText?`. |
| **Checkbox / Radio** | `core/Form/{Checkbox,Radio}.tsx` | Form primitives. |
| **Modal** | `core/Modal/Modal.tsx` | Backdrop dialog (Esc close, scroll lock). `open`, `title?`, `footer?`, `onClose`, `size?`(sm/md/lg/xl), `closeOnBackdrop?`. |
| **Select** | `core/Select/Select.tsx` | Native `<select>` wrapper. native attrs + `label?`, `error?`, `helperText?`, `options: SelectOption[]`, `placeholder?`. |
| **MultiCombobox** | `core/MultiCombobox/MultiCombobox.tsx` | Multi-select searchable + optional create. `options`, `value: string[]`, `onChange`, `allowCreate?`, `loading?`. |
| **ComboTreeBox** | `core/ComboTreeBox/ComboTreeBox.tsx` | Single-select hierarchical tree dropdown. `items: ComboTreeItem[]`(nested), `value?`, `onChange(id,item)`, `onClear?`. |
| **HoverInfo** | `core/Popover/Popover.tsx` | Hover tooltip/popover. `content`, `side?`. |

### `src/components/common/` (barrel re-exports some `core` primitives)
| Component | Path | Purpose |
|---|---|---|
| **LoadingSpinner** | `common/LoadingSpinner.tsx` | Standalone spinner. `size?`(sm/md/lg). |
| **EmptyState** | `common/EmptyState.tsx` | Default-export empty placeholder. |
| **ComboBox** | `common/ComboBox.tsx` | Multi-value picker. `value: string[]`, `valueCollection: ComboBoxOption[]`, `onChange`. |
| **DateTimePicker** | `common/DateTimePicker.tsx` | from/to range. `value: {fromDate,toDate}`, `onChange`, `type?`(date/datetime-local). |
| **WorkflowStepper** | `common/WorkflowStepper.tsx` | Step progress. `steps: string[]`, `currentIndex`, `cancelledLabel?`. |
| **ProtectedRoute** | `common/ProtectedRoute.tsx` | Route guard. `roles?`, `redirectTo?`. |
| **CustomerPickerModal** | `common/CustomerPickerModal.tsx` | Pick customer(s), single/multi. |
| **StaffPickerModal** | `common/StaffPickerModal.tsx` | Pick staff (filter location/role/active). |

### Layout & payment
- `layout/AdminLayout.tsx` (collapsible role-aware sidebar), `layout/CustomerLayout.tsx`, `layout/AuthLayout.tsx`.
- `payment/OrderDetail.tsx`, `payment/PaymentForm.tsx` (reads router `location.state`), `payment/PageHandlePayment/{PaymentSuccess,PaymentError,PaymentCancel}.tsx`.

### Formatting helpers (`src/common/utils/`)
- `formatCurrency.ts` → `formatCurrency(n)` (vi-VN VND), `formatNumber(n)`.
- `formatDate.ts` (dayjs) → `formatDate` (`DD/MM/YYYY`, `—` if empty), `formatDateTime` (`DD/MM/YYYY HH:mm`), `formatMonthYear` (`MM/YYYY`). Many pages still re-inline `Intl.NumberFormat` — prefer these helpers.

### ⚠️ Gaps vs CLAUDE.md (don't assume they exist)
- **No `FileUpload` component**, **no `ConfirmDialog`**, **no `useConfirm` hook**. Confirmations are ad-hoc `window.confirm(...)`; the only component confirm is page-scoped `pages/admin/Broadcast/components/ConfirmModal.tsx` (candidate to promote into `core/`).

---

## 10. `src/shared/`

- **`types/Request/`** and **`types/Reponse/`** — DTO folders (note the **intentional "Reponse" typo — do NOT fix**): Broadcast, Car, CarInquiry, Category, accessories, auth, and (Reponse) Location, Payment, Services.
- **`hooks/`** — legacy per-domain query hooks (BodyType, BrandAccessory, BrandCar, Car, Category, Payment, auth, location). Don't add new hooks here — use `src/query/`.
- **`validation/`** — **yup** schemas: `authSchemas.ts` (login/register/otp), `profileSchema.ts`, `workshopSchemas.ts`.
- **`components/`** — shared component library incl. `ErrorBoundary` (used by `main.tsx`) and `Form/SelectField.tsx`.

---

## 11. Domain modules (see `docs/FRONTEND_CLAUDE.md` for full specs)

Auth (username/phone/email + password, Google/Facebook OAuth, register→OTP, admin login) · Cars (public filtered list + detail; admin CRUD w/ multipart) · Accessories · Orders/Payment (`POST /orders/payment/order`, SePay QR/Cash) · Users/Profile (no delete, toggle-active) · HR (technicians, levels, skills, payroll) · Insurance (Company→Package→Policy→Claim) · Workshop (CustomerVehicle→Appointment→WorkOrder→parts/services) · Reviews (car & service, admin moderation) · Chat (SignalR real-time) · AI chatbot (`/ai/chat`) · Dashboard (Recharts/chart.js). **Live modules beyond the doc:** Premium plans/Subscriptions, Finance, Broadcast, CarInquiries, SupportChat, Staff dashboard.

---

## 12. Conventions checklist (enforced by `/fix-*` skills)

- New API resource → `apiClient` only; `Routes.ts` + `Routes.Fn.ts` + `query/<r>/{keys,useXxxQueries}.ts`.
- Mutation `onError`: do **not** `notify.error` (interceptor already toasts). Only `notify.success` on success.
- Admin CRUD: `DataTable` + `Modal` (no navigation to a new page).
- Forms: React Hook Form + yup resolver, inline `error` under field.
- Currency `formatCurrency` / dates `formatDate` from `src/common/utils/`.
- Thread `{ signal }` from queryFn into Routes.Fn (`withSignal`); every query param goes into the queryKey.

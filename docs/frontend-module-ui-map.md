# Frontend module -> UI map

Nguon uu tien khi implement API la `docs/api/modules/*.md` va `docs/api/endpoint-status-map.md`.
Bang nay map contract trong `docs/` sang route UI, query key, store va cache policy hien tai.

## Cache policy chung

| Loai du lieu | TanStack setting | Cach dung |
|---|---|---|
| Catalog/detail it doi | `staleTime: LIST_STALE_MS` = 5 phut, `gcTime` mac dinh 10 phut | Brand, body type, location, category, detail xe/phu kien, goi bao hiem |
| Search/list co filter | `staleTime: SEARCH_STALE_MS` = 30 giay, `placeholderData: keepPreviousData` | List xe, don hang, chat, review, appointment, work order |
| Mutation tao/sua/xoa | `invalidateQueries` theo query key goc | Sau khi submit form, de TanStack refetch ngam va cap nhat cache |
| Prefetch khi chuyen man | `queryClient.prefetchQuery` voi cung query key cua man dich | Dung o click/hover cua man A neu biet man X chac chan can data |

`gcTime` la thoi gian cache bi don sau khi query khong con observer. Neu component van mount va data qua `staleTime`, TanStack co the refetch khi mount lai, reconnect, focus hoac khi invalidate.

## Module map

| Docs module | Customer UI | Admin/Staff UI | Query/API hien co | Store/browser API |
|---|---|---|---|---|
| `auth.md`, `user-profile.md` | `/auth/*`, `/profile` | `/auth/admin/login`, protected `/admin/*` | `query/auth`, `authAPI`, axios interceptor | `useAuthStore` persist localStorage, `AuthProvider`, OAuth `useSearchParams` |
| `car.md` | `/cars`, `/cars/:id`, home/listings | `/admin/cars`, `/admin/brands`, `/admin/body-types` | `useCarList`, `useCarDetail`, `carKeys`, brand/body query | URL search params cho filter/paging |
| `accessory-category.md` | `/accessories`, `/accessories/:id`, `/cart` | `/admin/accessories`, `/admin/categories` | accessory/category/brand-accessory query modules | `useCartStore` persist localStorage |
| `orders-payment.md` | `/orders`, `/orders/:orderNumber`, payment callback pages | `/admin/orders` | `query/payment` | `useSearchParams` doc payment result, session flow thanh toan |
| `common-catalog.md` | filter xe/phu kien, dia chi | `/admin/locations` | brand/body/location/category query keys | Cache dai hon vi catalog it doi |
| `hr.md` | Staff area neu role duoc cap | `/admin/hr/technicians`, `/levels`, `/skills`, `/payroll` | `query/hr`, `hrKeys` | Role gate qua auth context/store |
| `insurance.md` | `/account/insurance` neu bat lai route account | `/admin/insurance/companies`, `/packages`, `/policies`, `/claims` | `query/insurance`, `insuranceKeys` | Multipart upload dung API layer |
| `workshop.md` | `/appointments`, account garage/work-orders | `/admin/workshop/appointments`, `/vehicles`, `/work-orders` | `query/workshop`, `workshopKeys` | Staff/admin/customer dung chung key theo params |
| `review.md` | `/reviews`, review trong detail xe/dich vu | `/admin/reviews` | `query/review`, `reviewKeys` | Invalidate pending/detail sau moderate/respond |
| `chat.md` | `/chat` | Nen them `/admin/chat` hoac staff panel tin nhan | Can tao query module `chat` neu chua co | Notification API cho tin nhan moi, IndexedDB cho draft/offline queue neu can |
| `ai-chatbot.md` | `/ai-chat` | KB admin neu can quan tri tri thuc | Can tao query module `ai-chat` neu chua co | IndexedDB/localStorage co the luu draft/session UI |

## Provider order

App dang duoc boc theo thu tu:

1. `QueryClientProvider`
2. `AuthProvider`
3. `ThemeProvider`
4. `LanguageProvider`
5. `BrowserRouter`

Auth/token van nam trong Zustand de axios interceptor dung duoc ngoai React tree. Context cung cap API `useContext` cho component UI can check auth/theme/language.

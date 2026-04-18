---
name: gen-api
description: Tạo API layer gồm service + query/mutation hook cho một resource. Dùng khi cần gọi API mới hoặc tạo data fetching hook.
argument-hint: "[resource] [actions: list|get|create|update|delete|all]"
disable-model-invocation: false
---

# Generate API Layer

Tạo đầy đủ service + hook cho một resource theo convention của project.

---

<!-- ═══════════════════════════════════════════════
     PROJECT CONFIG — SoldCar
     ═══════════════════════════════════════════════

HTTP_CLIENT=axios
  AXIOS_INSTANCE=src/services/api/index.ts
SERVER_STATE=react-query
API_BASE_URL=https://localhost:7250
API_STYLE=rest
RESPONSE_WRAPPER=no
PAGINATION_STYLE=page
  PAGE_SHAPE={ pageIndex: number, pageSize: number, totalCount: number, items: T[] }
ERROR_FORMAT={ message: string, statusCode: number }
MULTI_TENANT=no

SERVICES_DIR=src/services/api/functions/
HOOKS_DIR=src/shared/hooks/
TYPES_DIR=src/shared/types/

FILE_PATTERN=
  Routes.ts        — endpoint URL constants
  Routes.Fn.ts     — axios call functions (getList, getById, create, update, delete)
  Đặt tại: SERVICES_DIR/{Resource}/Routes.ts và Routes.Fn.ts

HOOK_PATTERN=
  HOOKS_DIR/{Resource}/index.ts
  Export queryKeys factory: export const {resource}Keys = { all, lists, list, detail }

TYPE_PATTERN=
  TYPES_DIR/Response/{Resource}/index.ts   — response types
  TYPES_DIR/Request/{Resource}/index.ts    — request/DTO types

RESOURCES=
  Car, BrandCar, BodyCar, Accessory, BrandAccessory
  Service, Category, Location, Payment, Auth, User
════════════════════════════════════════════════ -->

---

## Cấu trúc file tạo ra

```
TYPES_DIR/
  ${resource}.types.ts          # Request/Response interfaces

SERVICES_DIR/
  ${resource}.api.ts            # HTTP calls thuần (không có React hook)

HOOKS_DIR/
  queries/use${Resource}Query.ts    # useQuery hooks
  mutations/use${Resource}Mutation.ts # useMutation hooks
```

---

## Quy tắc

### Service layer (`*.api.ts`)
- Chỉ chứa HTTP calls, không có React hook
- Nếu `HTTP_CLIENT=axios`: import từ `AXIOS_INSTANCE`
- Nếu `RESPONSE_WRAPPER=yes`: unwrap data trước khi return, hoặc để hook xử lý — chọn 1 pattern và nhất quán
- Mỗi function: 1 endpoint, đặt tên theo action (`getList`, `getById`, `create`, `update`, `delete`)

### Query hooks (React Query)
- Query keys theo **factory pattern** (dễ invalidate):
  ```ts
  export const ${resource}Keys = {
    all: ['${resource}'] as const,
    lists: () => [...${resource}Keys.all, 'list'] as const,
    list: (params: unknown) => [...${resource}Keys.lists(), params] as const,
    detail: (id: string) => [...${resource}Keys.all, 'detail', id] as const,
  }
  ```
- Set `staleTime` hợp lý (data tĩnh: lớn, data realtime: 0)
- Dùng `enabled` flag khi query phụ thuộc vào param chưa có

### Mutation hooks
- Sau khi mutate thành công: `queryClient.invalidateQueries` đúng key
- Optimistic update nếu UX yêu cầu responsive
- Expose `isPending`, `isError`, `error` để UI xử lý

### Multi-tenant (nếu `MULTI_TENANT=yes`)
- `tenantId` là param bắt buộc cho mọi query có scope theo tenant
- Thêm vào query key để cache tách biệt giữa các tenant
- Source từ `TENANT_ID_SOURCE`

### TypeScript
- Interface riêng cho: `${Resource}` (entity), `Create${Resource}Dto`, `Update${Resource}Dto`, `${Resource}ListParams`
- Nếu `RESPONSE_WRAPPER=yes`: tạo generic `ApiResponse<T>`
- Pagination type theo `PAGINATION_STYLE`

---

## Hướng dẫn thực hiện

1. Parse `$ARGUMENTS` → resource name + actions
2. Tạo TypeScript interfaces trong `TYPES_DIR`
3. Tạo service functions trong `SERVICES_DIR`
4. Tạo query hook nếu actions gồm `list` hoặc `get`
5. Tạo mutation hook nếu actions gồm `create`, `update`, hoặc `delete`
6. Export query keys factory
7. Đánh dấu `// TODO:` chỗ cần điền business logic cụ thể

Tạo API layer cho: **$ARGUMENTS**

---
name: gen-schema
description: Tạo TypeScript interface/type và Zod schema từ mô tả hoặc API response mẫu. Dùng khi cần định nghĩa type cho entity mới, form schema, hoặc API contract.
argument-hint: "[entity name hoặc paste JSON mẫu]"
disable-model-invocation: false
---

# Generate Schema & Types

Tạo TypeScript types và validation schema cho entity hoặc API contract.

---

<!-- ═══════════════════════════════════════════════
     PROJECT CONFIG — SoldCar
     ═══════════════════════════════════════════════

LANGUAGE=typescript
VALIDATION=yup (primary form validation), zod (secondary/schema contracts)
RESPONSE_WRAPPER=no
PAGINATION_STYLE=page
  PAGE_SHAPE={ pageIndex: number, pageSize: number, totalCount: number, items: T[] }
MULTI_TENANT=no

TYPES_DIR=src/shared/types/
  RESPONSE_DIR=src/shared/types/Response/{Resource}/index.ts
  REQUEST_DIR=src/shared/types/Request/{Resource}/index.ts

FILE_EXTENSION=.ts (không dùng .tsx cho type files)

NAMING=
  Entity interface: PascalCase (Car, Accessory)
  Request DTO: Create{Entity}Dto, Update{Entity}Dto
  Response type: {Entity}Response hoặc {Entity}
  Params: {Entity}ListParams
  Yup schema: {entity}Schema (camelCase + suffix Schema)
════════════════════════════════════════════════ -->

---

## Output tạo ra

Với mỗi entity, tạo đủ các type sau:

```ts
// 1. Base entity (từ API về)
interface ${Entity} { ... }

// 2. DTO cho create
interface Create${Entity}Dto { ... }

// 3. DTO cho update (Partial của create thường)
interface Update${Entity}Dto { ... }

// 4. Query params (cho list endpoint)
interface ${Entity}ListParams { ... }

// 5. API Response types (nếu RESPONSE_WRAPPER=yes)
interface ApiResponse<T> { ... }
// Paginated: thường là { data: T[]; meta: ... } — align với WRAPPER_SHAPE + PAGINATION_STYLE
interface PaginatedResponse<T> { ... }

// 6. Zod schema (nếu VALIDATION=zod) — cho form validation
const create${Entity}Schema = z.object({ ... })
type Create${Entity}FormData = z.infer<typeof create${Entity}Schema>
```

---

## Quy tắc

### Naming
- Entity: `PascalCase` (Course, ExamResult)
- DTO: `PascalCase` + suffix `Dto` (CreateCourseDto)
- Params: `PascalCase` + suffix `Params` (CourseListParams)
- Schema: `camelCase` + suffix `Schema` (createCourseSchema)
- Inferred type từ schema: trùng với DTO name

### TypeScript
- Prefer `interface` cho object shape (extendable)
- Prefer `type` cho union, intersection, utility types
- Dùng `readonly` cho field không nên mutate
- Date field: `string` (ISO format từ API) không phải `Date`
- ID field: `string` (UUID) không phải `number` trừ khi backend dùng int

### Zod (nếu `VALIDATION=zod`)
- Schema cho **form** (Create/Update) không nhất thiết match 1-1 với entity
- Thêm validation message bằng tiếng Việt nếu project là Vietnamese app
- `optional()` cho field không bắt buộc, `nullable()` cho field có thể null

### Pagination (theo `PAGINATION_STYLE`)
- `offset`: `{ page: number, limit: number, total: number }`
- `cursor`: `{ cursor: string | null, hasNext: boolean, limit: number }`
- `page`: `{ page: number, pageSize: number, totalPages: number, totalItems: number }`

---

## Hướng dẫn thực hiện

1. Parse `$ARGUMENTS`:
   - Nếu là JSON mẫu → infer types từ shape
   - Nếu là tên entity + mô tả → tạo types theo business logic
2. Tạo đủ các type theo danh sách trên
3. Nếu `VALIDATION=zod`: tạo schema cho Create và Update form
4. Đặt file vào `TYPES_DIR/${entity}.types.ts`
5. Export tất cả, sẵn sàng import

Tạo schema cho: **$ARGUMENTS**

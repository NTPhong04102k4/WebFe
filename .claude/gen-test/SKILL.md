---
name: gen-test
description: Viết test cho component, hook, hoặc util function. Tạo file test với đầy đủ cases: render, interaction, loading/error state, edge cases.
argument-hint: "[file path hoặc component/hook name]"
disable-model-invocation: false
---

# Generate Tests

Viết test cho file target theo convention của project.

---

<!-- ═══════════════════════════════════════════════
     PROJECT CONFIG — SoldCar
     ═══════════════════════════════════════════════

TEST_RUNNER=vitest
COMPONENT_TEST=@testing-library/react
MOCK_LIB=vi.mock
SERVER_STATE=react-query
COVERAGE_THRESHOLD=70

TEST_COLOCATION=no
TEST_DIR=src/test/
TEST_SUFFIX=.test.tsx
SETUP_FILE=src/test/setup.ts
RENDER_UTIL=src/test/render.tsx   — custom render với QueryClient + Redux Provider

REDUX_STORE=src/redux/store.ts
REDUX_HOOKS=src/redux/hook.ts

BUSINESS_RULES=
  - Wrap test với custom render (đã có QueryClient + Redux Provider)
  - Mock axios instance tại src/services/api/index.ts khi test API calls
  - Auth state: dispatch setAuth action hoặc mock useAppSelector
  - React Query: dùng QueryClient với retry: false trong test
════════════════════════════════════════════════ -->

---

## Thứ tự ưu tiên khi viết test

1. **Smoke test** — render không crash
2. **Data display** — hiển thị đúng với mock data
3. **Loading / Error / Empty state** — các UI state
4. **User interaction** — click, input, submit
5. **Edge cases** — null, empty list, boundary values, error từ API

---

## Quy tắc

### Mock data
- Tạo mock data match **chính xác** với TypeScript interface
- Đặt mock data ở đầu file hoặc trong `__mocks__/` nếu dùng lại nhiều
- Factory function cho mock data phức tạp: `createMock${Resource}(overrides?)`

### Component test
- Query element bằng **role** trước (`getByRole`), rồi mới dùng `getByText`, `getByTestId`
- Không test implementation detail (class name, internal state)
- Dùng `userEvent` thay `fireEvent` cho user interaction
- Wrap async trong `waitFor` hoặc `findBy*`

### Hook test
- Dùng `renderHook` với wrapper cung cấp đủ provider (QueryClient, Router, Store)
- `QueryClient` test config: `{ defaultOptions: { queries: { retry: false } } }`
- Reset mock giữa các test: `beforeEach(() => vi.clearAllMocks())`

### Module mock
- Mock ở **module level** (ngoài `describe`), không mock trong `it`
- Chỉ mock dependency thực sự external (API, router, store)
- Không mock component con trừ khi nó quá nặng hoặc có side effect

### Test naming
```
describe('ComponentName hoặc hookName', () => {
  describe('khi [điều kiện]', () => {
    it('[hành vi mong đợi]', () => { ... })
  })
})
```

---

## Template wrapper cho React Query

```ts
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

---

## Hướng dẫn thực hiện

1. Đọc file target từ `$ARGUMENTS`
2. Xác định loại: component | hook | util
3. Tạo mock data phù hợp
4. Viết test theo thứ tự ưu tiên ở trên
5. Mock external dependency (API, router, store, timer)
6. Đặt file theo `TEST_COLOCATION` và `TEST_SUFFIX`
7. Đảm bảo coverage đạt `COVERAGE_THRESHOLD`

Viết test cho: **$ARGUMENTS**

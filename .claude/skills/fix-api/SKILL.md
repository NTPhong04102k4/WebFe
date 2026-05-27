---
name: fix-api
description: Fix lỗi API layer: sai axios instance, thiếu unwrap OperationResult, sai locationID, suppressErrorToast, withSignal.
argument-hint: "[file path hoặc để trống]"
---

# Fix API Layer — SoldCar

## 2 Axios instances — KHÔNG được nhầm

| Instance | Export | File | Dùng khi |
|---|---|---|---|
| `apiClient` | default | `src/services/api/index.ts` | **TẤT CẢ** api functions trong `src/services/api/functions/` |
| `api` | default | `src/services/api/axiosInstance.ts` | Legacy — chỉ dùng nếu file đã có, KHÔNG thêm mới |

```ts
// ✅ ĐÚNG
import apiClient from "@/services/api";

// ❌ SAI — dùng api từ axiosInstance cho resource mới
import api from "@/services/api/axiosInstance";
```

Cả 2 instance đều có interceptor tự gọi `notify.error(errData.message)` khi `success === false`.
`api` (axiosInstance) còn có thêm cờ `suppressErrorToast` và logic refresh token.

## Response shape — unwrap OperationResult

Backend trả 2 dạng:
```ts
// Dạng 1 — plain data
T

// Dạng 2 — wrapped
{ success: boolean; message: string; data: T }   // OperationResult<T>

// Dạng 3 — paginated
{ data: T[]; totalCount: number; page: number; pageSize: number }  // PagedResult<T>
```

Unwrap helper (copy vào Routes.Fn.ts nếu cần):
```ts
function unwrap<T>(payload: T | OperationResult<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }
  return payload as T;
}
```

Khi dùng:
```ts
// List — PagedResult: KHÔNG unwrap, trả thẳng res.data
const res = await apiClient.get<PagedResult<WorkshopViewModel>>(route.list, withSignal({ params }, options));
return res.data;  // { data: [...], totalCount, page, pageSize }

// Detail — unwrap nếu có thể là OperationResult
const res = await apiClient.get<WorkshopViewModel | OperationResult<WorkshopViewModel>>(route.detail(id), withSignal({}, options));
return unwrap(res.data);

// Create/Update/Delete — thường trả OperationResult (không cần unwrap, caller ít dùng data)
const res = await apiClient.post<OperationResult>(route.list, body);
return res.data;
```

## withSignal — luôn dùng cho GET

`withSignal` merge `signal` vào AxiosConfig, cho phép React Query huỷ request khi component unmount:
```ts
import { withSignal } from "../../requestOptions";
import type { ApiRequestOptions } from "../../requestOptions";

list: async (params: Record<string, unknown>, options?: ApiRequestOptions) => {
  const res = await apiClient.get<PagedResult<T>>(route.list, withSignal({ params }, options));
  return res.data;
},
```

## LocationID workaround

`/common/locations` trả `locationCode: string` (e.g. "HN01"), KHÔNG có numeric `locationID`.
Backend appointment API cần numeric `locationID`.

**Pattern đã dùng trong codebase** (xem `CreateCarForm.tsx`):
```ts
// Dùng index + 1 làm ID tạm (1-based)
function getLocationID(code: string, locations: LocationResponse[]): number {
  const idx = locations.findIndex((l) => l.locationCode === code);
  return idx + 1;  // -1 + 1 = 0 nếu không tìm thấy → coi như invalid
}

// Hoặc inline khi build options:
const locationOptions = locations.map((loc, idx) => ({
  value: String(idx + 1),  // numeric ID as string for select value
  label: loc.locationName,
}));

// Khi gọi API:
locationID: Number(selectedLocationValue)  // đã là "1", "2", ... → parseInt hợp lệ
```

**Lỗi thường gặp**: `Number("HN01") = NaN` → `JSON.stringify({locationID: NaN}) = '{"locationID":null}'` → backend 400.

## suppressErrorToast

Chỉ dùng khi endpoint trả 404 / error là **expected behavior** (không phải bug thật):
```ts
// Trong api function — KHÔNG phải trong component
const res = await api.get<T>(url, { suppressErrorToast: true } as AxiosRequestConfig);
```

Không bao giờ dùng `suppressErrorToast` để che giấu lỗi thật hoặc để tránh double toast —
double toast là lỗi của component (xem skill fix-toast).

## Hướng dẫn thực hiện

1. Đọc file từ `$ARGUMENTS`
2. Kiểm tra import: có dùng đúng `apiClient` chưa?
3. Kiểm tra response: có cần unwrap không? List hay detail?
4. Kiểm tra GET functions: có truyền `withSignal` không?
5. Nếu có `locationID` → kiểm tra nguồn gốc value (không được parse string code thành Number)
6. Fix từng vấn đề theo pattern trên

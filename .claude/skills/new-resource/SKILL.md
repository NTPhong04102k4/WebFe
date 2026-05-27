---
name: new-resource
description: Scaffold đầy đủ API layer cho một resource mới: Routes.ts, Routes.Fn.ts, keys.ts, useXxxQueries.ts. Theo đúng convention của SoldCar.
argument-hint: "[ResourceName] [actions: list|get|create|update|delete|all]"
---

# Scaffold Resource API Layer — SoldCar

## Cấu trúc file tạo ra

```
src/services/api/functions/{Resource}/
  Routes.ts          ← endpoint URL constants
  Routes.Fn.ts       ← axios functions (gọi apiClient)

src/query/{resource}/
  keys.ts            ← query keys factory
  use{Resource}Queries.ts  ← useQuery + useMutation hooks
```

## Config cố định (không cần hỏi lại)

```
HTTP_CLIENT=axios
AXIOS_INSTANCE=src/services/api/index.ts  (export: apiClient)
SERVER_STATE=react-query
API_STYLE=rest
RESPONSE_WRAPPER=yes (OperationResult<T> hoặc plain T — cần unwrap)
PAGINATION=PagedResult<T> = { data: T[], totalCount, page, pageSize }
```

## Templates

### Routes.ts
```ts
export const {resource}Route = {
  list: "/{resource}s",
  detail: (id: string | number) => `/{resource}s/${id}`,
  // thêm sub-route nếu cần
} as const;
```

### Routes.Fn.ts
```ts
import apiClient from "@/services/api";           // LUÔN dùng apiClient, không dùng api từ axiosInstance
import type { OperationResult } from "src/services/types/common.types";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { {Resource}ViewModel, {Resource}ListResult, Create{Resource}Dto, Update{Resource}Dto } from "./{resource}.types";
import { {resource}Route } from "./Routes";

// Unwrap helper nếu backend trả OperationResult<T>
function unwrap<T>(payload: T | OperationResult<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }
  return payload as T;
}

export const {resource}Api = {
  list: async (params: Record<string, unknown>, options?: ApiRequestOptions) => {
    const res = await apiClient.get<{Resource}ListResult>(
      {resource}Route.list,
      withSignal({ params }, options)
    );
    return res.data;
  },
  detail: async (id: string | number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<{Resource}ViewModel | OperationResult<{Resource}ViewModel>>(
      {resource}Route.detail(id),
      withSignal({}, options)
    );
    return unwrap(res.data);
  },
  create: async (body: Create{Resource}Dto) => {
    const res = await apiClient.post<OperationResult>({resource}Route.list, body);
    return res.data;
  },
  update: async (id: string | number, body: Update{Resource}Dto) => {
    const res = await apiClient.put<OperationResult>({resource}Route.detail(id), body);
    return res.data;
  },
  delete: async (id: string | number) => {
    await apiClient.delete({resource}Route.detail(id));
  },
};
```

### keys.ts
```ts
export const {resource}Keys = {
  all: ["{resource}"] as const,
  lists: () => [...{resource}Keys.all, "list"] as const,
  list: (params: unknown) => [...{resource}Keys.lists(), params] as const,
  detail: (id: string | number) => [...{resource}Keys.all, "detail", id] as const,
};
```

### use{Resource}Queries.ts
```ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_STALE_MS } from "src/query/queryClient";
import { {resource}Api } from "src/services/api/functions/{Resource}/Routes.Fn";
import { {resource}Keys } from "./keys";

// Query — list
export function use{Resource}List(params: Record<string, unknown>) {
  return useQuery({
    queryKey: {resource}Keys.list(params),
    queryFn: ({ signal }) => {resource}Api.list(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

// Query — detail
export function use{Resource}Detail(id: string | number | null) {
  return useQuery({
    queryKey: id != null ? {resource}Keys.detail(id) : ["{resource}", "none"],
    queryFn: ({ signal }) => {resource}Api.detail(id!, { signal }),
    enabled: id != null,
  });
}

// Mutations
export function use{Resource}Mutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: {resource}Keys.lists() });

  return {
    create: useMutation({
      mutationFn: (body: Create{Resource}Dto) => {resource}Api.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string | number; body: Update{Resource}Dto }) =>
        {resource}Api.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string | number) => {resource}Api.delete(id),
      onSuccess: invalidate,
    }),
  };
}
```

## Lưu ý quan trọng

- **Error toast**: KHÔNG thêm `notify.error` trong component — interceptor trong `src/services/api/index.ts` tự xử lý
- **Naming**: ResourceName = PascalCase (`Workshop`), route key = camelCase (`workshop`), file folder = PascalCase
- **Existing resources để tham khảo**: `src/services/api/functions/workshop/`, `src/query/workshop/`
- **Types file**: Tạo `{resource}.types.ts` trong cùng folder với Routes.Fn.ts nếu chưa có, hoặc tìm trong `src/shared/types/`

## Hướng dẫn thực hiện

1. Parse `$ARGUMENTS` → ResourceName + actions
2. Kiểm tra xem resource đã tồn tại chưa (Glob `src/services/api/functions/{Resource}/`)
3. Tạo/cập nhật từng file theo template trên
4. Chỉ tạo hooks tương ứng actions yêu cầu (list/get → query, create/update/delete → mutation)
5. Nếu action = `all` → tạo toàn bộ

Scaffold resource: **$ARGUMENTS**

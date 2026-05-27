---
name: fix-toast
description: Xóa double-toast anti-pattern trong file được chỉ định. Interceptor axios đã tự hiện toast lỗi — component không được gọi notify.error thêm lần nữa.
argument-hint: "[file path hoặc để trống để scan file đang mở]"
---

# Fix Double-Toast Pattern — SoldCar

## Bối cảnh project

Dự án có **2 axios instance**:
- `src/services/api/axiosInstance.ts` → export `api` — có response interceptor tự gọi `notify.error(errData.message)` khi `success === false`, trừ khi config có `suppressErrorToast: true`
- `src/services/api/index.ts` → export `apiClient` — tương tự, dispatch `auth:unauthorized` event thay vì `window.location.href`

**Quy tắc dứt khoát:**
- ✅ Component chỉ được gọi: `notify.success()`, `notify.info()`
- ❌ Không bao giờ gọi `notify.error()` trong `onError`, `catch`, sau mutate
- ❌ Không gọi `notify.error()` trong `try/catch` bao quanh `mutateAsync`

## Cách fix

### Pattern 1 — onError callback
```tsx
// ❌ TRƯỚC
mutation.mutate(data, {
  onSuccess: () => notify.success("OK"),
  onError: (err) => notify.error(err.message),   // BỎ dòng này
});

// ✅ SAU
mutation.mutate(data, {
  onSuccess: () => notify.success("OK"),
  // interceptor đã xử lý error toast
});
```

### Pattern 2 — try/catch với mutateAsync
```tsx
// ❌ TRƯỚC
try {
  await mutation.mutateAsync(data);
  notify.success("OK");
} catch (error) {
  notify.error(getErrorMessage(error));  // BỎ dòng này
}

// ✅ SAU
try {
  await mutation.mutateAsync(data);
  notify.success("OK");
} catch {
  // interceptor đã xử lý error toast
}
```

### Pattern 3 — catch có logic khác (giữ lại phần không phải toast)
```tsx
// Nếu catch có logic thực sự (redirect, reset state) → giữ lại, chỉ xóa notify.error
try {
  await mutation.mutateAsync(data);
} catch {
  setOpen(false);  // giữ lại
  // notify.error đã bị xóa
}
```

### Exception — suppressErrorToast
Chỉ khi API endpoint trả 404 là expected behavior (không phải lỗi thật) thì mới cần suppress:
```ts
// Trong api function, không phải trong component
const res = await apiClient.get(url, { suppressErrorToast: true } as AxiosRequestConfig);
```

## Hướng dẫn thực hiện

1. Đọc file từ `$ARGUMENTS` (hoặc file hiện tại nếu không có argument)
2. Tìm tất cả `notify.error` trong file
3. Với mỗi `notify.error` tìm thấy:
   - Nếu trong `onError` callback → xóa toàn bộ callback key `onError:`
   - Nếu trong `catch` block → xóa dòng `notify.error(...)`, giữ lại logic khác nếu có
   - Nếu trong component handler (không phải API call) → giữ nguyên (user input validation là OK)
4. Show diff trước/sau
5. Liệt kê số lượng `notify.error` đã xóa

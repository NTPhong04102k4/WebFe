---
name: refactor-profile
description: Chia nhỏ component Profile, chuyển sang dùng component/core, bổ sung trường bắt buộc (email, username, identityNumber) và cơ chế fallback API/Store.
argument-hint: "[path to Profile/index.tsx]"
---

# Refactor Profile Component — SoldCar

## Quy tắc bắt buộc khi Refactor Profile

### 1. Sử dụng core components từ `src/components/core`
Tuyệt đối không dùng thẻ HTML thô cho input, select.
- `<input>` -> `<Input>` (từ `@/components/core`)
- `<select>` -> `<Select>` (từ `@/components/core`)
- Các props `label`, `error`, `required` đều được hỗ trợ trực tiếp.

### 2. Tách nhỏ component thành các file độc lập
Không viết gộp tất cả sub-components trong cùng một file `index.tsx`.
Cấu trúc thư mục mới:
```
src/pages/customer/Profile/
├── components/
│   ├── AvatarSection.tsx          # Ảnh đại diện + upload
│   ├── InfoSection.tsx            # Thông tin cá nhân + form edit
│   ├── ChangePasswordSection.tsx  # Đổi mật khẩu
│   └── SubscriptionSection.tsx    # Thông tin gói thành viên
└── index.tsx                      # Page coordinator (fetch data & orchestration)
```

### 3. Validation cho các trường bắt buộc
Cập nhật `profileEditSchema` trong `src/query/user/useProfileQuery.ts` (Zod):
- **Email**: Bắt buộc và đúng định dạng.
  `email: z.string().min(1, "Email là bắt buộc.").email("Email không đúng định dạng.")`
- **Username**: Bắt buộc.
  `username: z.string().min(1, "Username là bắt buộc.")`
- **IdentiNumber**: Bắt buộc.
  `identityNumber: z.string().min(1, "IdentiNumber là bắt buộc.")`

### 4. Cơ chế Fallback dữ liệu mặc định (API -> Store)
Khi hiển thị giá trị mặc định cho form hoặc thông tin, luôn kiểm tra dữ liệu trả về từ API trước, nếu không có mới fallback về thông tin lưu trong Zustand `authStore`:
- **Email**: `profileQuery.data?.email ?? user?.email ?? ""`
- **Username**: `profileQuery.data?.username ?? user?.username ?? ""`
- **Identity Number**: `profileQuery.data?.identityNumber ?? user?.identityNumber ?? ""`

---

## Hướng dẫn thực hiện chi tiết

### Bước 1: Cập nhật Schema & Mutation Query
1. Mở file `src/query/user/useProfileQuery.ts`.
2. Thêm `email`, `username`, `identityNumber` vào `profileEditSchema`.
3. Trong `useUpdateProfile` mutation:
   - Thêm các tham số này vào `FormData` payload gửi đi.
   - Trong callback `onSuccess`, cập nhật dữ liệu mới ngược lại Zustand auth store thông qua `setUser` của `useAuthStore`.

### Bước 2: Tách nhỏ các Component
Tạo thư mục `src/pages/customer/Profile/components/` và viết các file:
- **`AvatarSection.tsx`**: Nhận các props cơ bản để hiển thị và update avatar.
- **`InfoSection.tsx`**: Sử dụng `react-hook-form` + `zodResolver(profileEditSchema)`. Thay thế `FormField` cũ bằng `<Input>` và `<Select>` từ `@/components/core`. Hiển thị cả 3 trường `email`, `username`, `identityNumber` ở cả chế độ view và edit.
- **`ChangePasswordSection.tsx`**: Thay thế các ô nhập mật khẩu bằng `<Input type="password" ... />`.
- **`SubscriptionSection.tsx`**: Giữ nguyên logic hiển thị và action liên quan gói thành viên.

### Bước 3: Cập nhật file `index.tsx` chính
1. Khai báo các biến fallback từ API và Store:
   ```typescript
   const profile = profileQuery.data;
   const displayName = user?.fullName || user?.username || "";
   const username = profile?.username ?? user?.username ?? "";
   const email = profile?.email ?? user?.email ?? "";
   const imageUrl = user?.image ?? profile?.image ?? "";
   const identityNumber = profile?.identityNumber ?? user?.identityNumber ?? "";
   ```
2. Truyền `defaultValues` hoàn chỉnh có chứa các trường mới xuống `InfoSection`.
3. Import các subcomponents từ thư mục `./components/` và ráp nối chúng lại để hiển thị trang Profile hoàn chỉnh.

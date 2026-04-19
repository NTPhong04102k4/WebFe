# Module: Auth (`/auth`, `/auth/admin`)

## 1. Đăng nhập khách (Customer)

### `POST /auth/login`

**Payload (JSON)**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|--------|
| usernameOrPhoneOrEmail | string | ✓ | Tài khoản / SĐT / email |
| password | string | ✓ | Mật khẩu |

**Response 200**

```json
{
  "access_token": "jwt...",
  "refresh_token": "opaque...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "Customer"
}
```

**Lỗi:** `401` — `{ "error": "..." }` (user không tồn tại, sai MK, khóa tài khoản, …).

---

### `POST /auth/register`

**Payload (JSON)**

| Field | Type | Bắt buộc |
|-------|------|----------|
| username | string | ✓ (≤100) |
| email | string | ✓ (email) |
| password | string | ✓ (6–100 ký tự) |

**Response 200:** `OperationResult` — `{ "success": true, "message": "OTP đã gửi..." }`  
**409:** email/username trùng — `errorCode`: `EmailExists` / `UserNameExists`.

---

### `POST /auth/verify-otp`

**Payload (JSON)**

| Field | Type | Bắt buộc |
|-------|------|----------|
| email | string | ✓ |
| otpCode | string | ✓ (đúng 6 ký tự) |

**Response 201:** `OperationResult` với `data` chứa token + user:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": 0,
      "username": "",
      "email": "",
      "fullName": "",
      "emailVerified": true
    }
  }
}
```

*(Lưu ý: `data` là anonymous object — snake_case không áp dụng; field là camelCase trong JSON.)*

---

### `POST /auth/resend-otp`

**Payload:** `{ "email": "" }`

**Response 200:** `{ "success": true, "message": "..." }`  
**409:** email đã đăng ký.

---

### `POST /auth/logout`

**Header:** `Authorization: Bearer ...`

**Payload (JSON, tùy chọn)**

| Field | Type | Mô tả |
|-------|------|--------|
| refreshToken | string? | Gửi để revoke refresh token |

**Response 200:** `{ "success": true, "message": "Logout successful." }`

---

### `POST /auth/refresh-token`

**Payload:** `{ "refreshToken": "" }`

**Response 200:** cùng shape **`TokenResponse`** như login (`access_token`, `refresh_token`, …).

**401:** refresh token hết hạn / không hợp lệ.

---

### OAuth Google / Facebook

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/auth/login/google` | Redirect OAuth |
| GET | `/auth/callback/google` | HTML + `postMessage` cho popup |
| GET | `/auth/login/facebook` | Redirect OAuth |
| GET | `/auth/callback/facebook` | HTML + `postMessage` |

Payload không phải JSON REST; frontend mở popup và lắng nghe `message` từ opener.

---

## 2. Admin / Staff (`/auth/admin`)

### `POST /auth/admin/login`

**Payload (JSON)**

| Field | Type |
|-------|------|
| username | string |
| password | string |

**Response 200 — `LoginAdminResponse`**

```json
{
  "fullName": "",
  "token": "jwt..."
}
```

**401:** `{ "message": "Username or password is incorrect" }`

---

### `POST /auth/admin/staff/create`

**Header:** Bearer, role **SuperAdmin**.

**Payload (JSON)** — `CreateStaffRequest` (`Models/InputModel/Auth/Admin/CreateStaffRequest.cs`)

| Field | Type |
|-------|------|
| username | string |
| email | string |
| password | string |
| fullName | string |
| phone | string |
| locationID | number |
| roleID | number |
| createBy | number |

**Response 201:** `OperationResult` — `success: true`, `data` có thể chứa thông tin staff tạo mới (theo service).  
**409:** `UsernameExists` / `EmailExists`.

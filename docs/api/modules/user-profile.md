# Module: User & file (`/user`, `/user/files`)

## 1. Hồ sơ người dùng

### `GET /user/detail`

**Header:** `Authorization: Bearer` — role **Customer**.

**Query**

| Param | Mô tả |
|-------|--------|
| gmailOrUserName | Email hoặc username cần lấy |

**Response 200:** object user từ DB (các field như `UserID`, `Username`, `Email`, `Phone`, … — theo entity/service).

**404:** `{ "message": "User not found." }`

---

### `POST /user/update-profile`

**Header:** Bearer — **Customer**.  
**Content-Type:** `multipart/form-data`

| Field | Type | Mô tả |
|-------|------|--------|
| phone | string? | |
| address | string? | |
| firstName | string? | |
| lastName | string? | |
| email | string | Bắt buộc trong form |
| username | string | Bắt buộc trong form |
| identiNumber | string | Theo model |
| isActive | bool? | |
| image | file? | Ảnh đại diện (JPEG/PNG/GIF, ≤10MB) |

**Response 200:** user đã cập nhật (kèm URL ảnh signed nếu có).

---

### `PATCH /user/changepassword`

**Header:** Bearer — **Customer**.

**Query (không phải JSON body)**

| Param | Mô tả |
|-------|--------|
| passwordOld | Mật khẩu cũ |
| newPassword | Mật khẩu mới |
| username | Username |

**Response 200:** kết quả cập nhật; **401** nếu sai mật khẩu hoặc tài khoản social.

---

### `PATCH /user/forgetPassword`

**Query:** `email=`

**Response 200:** `{ "success": true, "message": "...", "step": "otp_sent" }`

---

### `POST /user/verifyOtpForPassword`

**Payload (JSON):** `email`, `otpCode` (đúng 6 ký tự).

**Response 200:** `{ "success": true, "message": "<temp password>", "step": "temp_password_sent", "expiresIn": "3 minutes" }`

---

### `POST /user/resetPasswordWithTemp`

**Payload (JSON):** `email`, `temporaryPassword`, `newPassword`

**Response 200:** `{ "success": true, "message": "...", "step": "password_reset_complete" }`

---

### `POST /user/send-gmail-message`

**Header:** Bearer — **Customer**.

**Payload (JSON)**

```json
{
  "subject": "",
  "message": ""
}
```

**Response:** OK hoặc `400` nếu thiếu subject/message.

---

## 2. Upload file

### `POST /user/files/upload`

**Content-Type:** `multipart/form-data`

| Field | Type |
|-------|------|
| file | file (≤10MB) |

**Response 200**

```json
{
  "url": "https://..."
}
```

**Lưu ý:** Endpoint hiện không bắt buộc JWT trong code — kiểm tra lại trước khi dùng production.

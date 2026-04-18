# User Module — API Documentation

Base paths: `/user`, `/user/files`

---

## Endpoints

### GET /user/detail
Lấy thông tin người dùng.

**Auth:** ✅ `Customer`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| gmailOrUserName | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `UserDb` object |
| 404 | Không tìm thấy | `{ message: "User not found." }` |

---

### POST /user/update-profile
Cập nhật thông tin hồ sơ người dùng.

**Auth:** ✅ `Customer`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Email | string | ✅ | |
| Username | string | ✅ | |
| IdentiNumber | string | ✅ | |
| Phone | string | ❌ optional | |
| Address | string | ❌ optional | |
| FirstName | string | ❌ optional | |
| LastName | string | ❌ optional | |
| Image | file | ❌ optional | max 10MB; jpeg, jpg, png, gif |
| IsActive | bool | ❌ optional | |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `UpdateProfileRequest` |
| 400 | Validation lỗi | `{ message }` |
| 404 | Không tìm thấy | `{ message: "User not found." }` |

---

### PATCH /user/changepassword
Đổi mật khẩu.

**Auth:** ✅ `Customer`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| passwordOld | string | ✅ |
| newPassword | string | ✅ |
| username | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Đổi thành công | result object |
| 400 | Cập nhật thất bại | `{ message: "Failed to update password user." }` |
| 401 | Mật khẩu sai / không có hash | error message |
| 404 | Không tìm thấy | `{ message: "User not found." }` |

---

### PATCH /user/forgetPassword
Yêu cầu đặt lại mật khẩu — gửi OTP qua email.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| email | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | OTP đã gửi | `{ success: true, message, step: "otp_sent" }` |
| 400 | Email rỗng | `"Email must exist and not be empty."` |
| 404 | Không tìm thấy | `"User not found or user not linking with account exists."` |
| 500 | Lỗi server | error message |

---

### POST /user/verifyOtpForPassword
Xác thực OTP — nhận mật khẩu tạm thời.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Email | string | ✅ | email format |
| OtpCode | string | ✅ | đúng 6 chữ số |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Xác thực thành công | `{ success: true, message: "<tempPassword>", step: "temp_password_sent", expiresIn: "3 minutes" }` |
| 400 | Thiếu thông tin | `"Email and OTP code are required"` |
| 401 | OTP sai / hết hạn | `"Invalid or expired OTP code"` |
| 404 | Không tìm thấy | `"User not found"` |
| 500 | Lỗi server | error message |

---

### POST /user/resetPasswordWithTemp
Đặt lại mật khẩu bằng mật khẩu tạm.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Email | string | ✅ | email format |
| TemporaryPassword | string | ✅ | đúng 8 ký tự |
| NewPassword | string | ✅ | 6–100 ký tự |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Đặt lại thành công | `{ success: true, message, step: "password_reset_complete" }` |
| 400 | Thiếu thông tin | `"Email, temporary password, and new password are required"` |
| 401 | Mật khẩu tạm sai / hết hạn | `"Invalid or expired temporary password"` |
| 404 | Không tìm thấy | `"User not found"` |
| 500 | Lỗi server | error message |

> Luồng quên mật khẩu: `forgetPassword` → `verifyOtpForPassword` → `resetPasswordWithTemp`

---

### POST /user/send-gmail-message
Gửi email tới admin từ tài khoản người dùng.

**Auth:** ✅ `Customer`

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| Subject | string | ✅ |
| Message | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Gửi thành công | `{ success: true, message: "Email sent successfully." }` |
| 400 | Thiếu Subject / Message | `{ message: "Subject and message are required." }` |
| 401 | Không xác định email user | `{ message: "Cannot determine current user's email." }` |
| 500 | Lỗi gửi | `{ message: "Failed to send email." }` |

---

### POST /user/files/upload
Upload file lên Google Cloud Storage.

**Auth:** Không yêu cầu  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| File | file | ✅ | max 10MB |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Upload thành công | `{ url: "https://..." }` |
| 400 | Validation lỗi | error message |
| 500 | Lỗi upload | error message |

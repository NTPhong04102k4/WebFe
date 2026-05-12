# Auth Module — API Documentation

> **FE / codegen:** contract tập trung — **[`../api/modules/auth.md`](../api/modules/auth.md)**. Nếu mâu thuẫn, chốt theo `api/modules/`.

Base paths: `/auth`, `/auth/admin`

---

## Endpoints

### POST /auth/register
Đăng ký tài khoản mới, gửi OTP qua email.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Username | string | ✅ | max 100 |
| Email | string | ✅ | email format, max 100 |
| Password | string | ✅ | min 6, max 100 |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Gửi OTP thành công | `OperationResult { Success, Message }` |
| 400 | Validation lỗi, gửi email thất bại | `OperationResult { Success: false, ErrorCode, Message }` |
| 409 | Email / Username đã tồn tại | `OperationResult { Success: false, ErrorCode: "EmailExists"\|"UsernameExists" }` |
| 500 | Lỗi server | `OperationResult { Success: false, ErrorCode: "InternalError" }` |

---

### POST /auth/verify-otp
Xác thực OTP và nhận token đăng nhập.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Email | string | ✅ | email format |
| OtpCode | string | ✅ | đúng 6 chữ số |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 201 | Xác thực thành công | `OperationResult { Success: true, Data: { accessToken, refreshToken, expiresIn, tokenType, user } }` |
| 400 | OTP sai, dữ liệu đăng ký không tìm thấy | `OperationResult { Success: false, ErrorCode, Message }` |
| 500 | Lỗi server | `OperationResult` |

---

### POST /auth/resend-otp
Gửi lại OTP.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| Email | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Gửi lại thành công | `OperationResult { Success: true, Message }` |
| 409 | Email đã được đăng ký | `OperationResult { Success: false }` |
| 500 | Lỗi server | `OperationResult` |

---

### POST /auth/login
Đăng nhập bằng tài khoản nội bộ.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| UsernameOrPhoneOrEmail | string | ✅ |
| Password | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `TokenResponse { access_token, refresh_token, expires_in, token_type, scope }` |
| 401 | Sai thông tin, bị khoá, không hoạt động | `{ error, code }` |

> Tài khoản bị khoá sau 5 lần sai liên tiếp (5 phút).

---

### GET /auth/login/google
Khởi tạo luồng OAuth Google. Trả về redirect.

**Auth:** Không yêu cầu

---

### GET /auth/callback/google
Callback sau OAuth Google.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| code | string | ✅ |
| state | string | ✅ |

**Response:** HTML page với `postMessage` chứa `GOOGLE_LOGIN_SUCCESS` hoặc `GOOGLE_LOGIN_ERROR`

---

### GET /auth/login/facebook
Khởi tạo luồng OAuth Facebook. Trả về redirect.

---

### GET /auth/callback/facebook
Callback sau OAuth Facebook. Tương tự Google.

---

### POST /auth/refresh-token
Làm mới access token.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| RefreshToken | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `TokenResponse` |
| 400 | Thiếu refresh token | `OperationResult` |
| 401 | Token hết hạn / không hợp lệ, user bị khoá | `OperationResult` |

---

### POST /auth/logout
Đăng xuất, thu hồi refresh token.

**Auth:** ✅ (bất kỳ role)

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| RefreshToken | string | ❌ optional |

**Response:** `200 OK` — `OperationResult { Success: true, Message }`

---

### POST /auth/admin/login
Đăng nhập dành cho Admin / SuperAdmin.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| Username | string | ✅ |
| Password | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `LoginAdminResponse { FullName, Token }` |
| 401 | Sai thông tin | `{ message }` |

---

### POST /auth/admin/staff/create
Tạo tài khoản nhân viên mới.

**Auth:** ✅ `SuperAdmin`

**Request Body** `application/json`
| Field | Type | Required |
|-------|------|----------|
| username | string | ✅ |
| email | string | ✅ |
| password | string | ✅ |
| fullName | string | ✅ |
| phone | string | ✅ |
| LocationID | int | ✅ |
| RoleID | int | ✅ |
| createBy | int | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 201 | Tạo thành công | `OperationResult { Success: true, Data: StaffReponse }` |
| 400 | Validation lỗi | `OperationResult` |
| 409 | Username / email đã tồn tại | `OperationResult` |

---

## Response Schemas

### TokenResponse
```json
{
  "access_token": "string",
  "refresh_token": "string",        // optional
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "string"
}
```

### LoginAdminResponse
```json
{
  "fullName": "string",
  "token": "string"
}
```

### StaffReponse
```json
{
  "staffCode": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "location": "string",
  "role": "string"
}
```

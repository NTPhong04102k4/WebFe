# User API

Contract source: `docs/api/modules/user-profile.md`.

Base path: `/user`

| Method | Path | Description |
|---|---|---|
| GET | `/user/{gmailOrUserName}` | Get user by email or username |
| PATCH | `/user/profile` | Update user profile, multipart form |
| PATCH | `/user/changepassword` | Change password |
| PATCH | `/user/forgetPassword?email={email}` | Start forgot password flow |
| POST | `/user/verifyOtpForPassword` | Verify OTP for forgot password |
| POST | `/user/resetPasswordWithTemp` | Reset password with temporary password |
| POST | `/user/send-gmail-message` | Send support email |
| PATCH | `/user/fcm-token` | Update FCM token |

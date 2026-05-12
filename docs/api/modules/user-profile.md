# Module: User Profile (`/user`, `/user/files`)

## Profile

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/user/{gmailOrUserName}` | Customer | route email or username | `OperationResult.data = user` |
| PATCH | `/user/profile` | Customer | multipart `UpdateUserProfilesInput` | `OperationResult.data = update result` |
| PATCH | `/user/changepassword` | Customer | query `passwordOld`, `newPassword`, `username` | `OperationResult` |
| PATCH | `/user/forgetPassword?email={email}` | Public | query `email` | `OperationResult` |
| POST | `/user/verifyOtpForPassword` | Public | JSON `VerifyOtpForPasswordRequest` | `OperationResult` |
| POST | `/user/resetPasswordWithTemp` | Public | JSON `ResetPasswordWithTempRequest` | `OperationResult` |
| POST | `/user/send-gmail-message` | Customer | JSON `GmailMessageRequest` | `OperationResult` |
| PATCH | `/user/fcm-token` | Customer | JSON `UpdateFcmTokenRequest` | `OperationResult` |

## Upload

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/user/files/upload` | none in current code | multipart `file` | `{ url }` |

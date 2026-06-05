export interface LoginRequest {
  usernameOrPhoneOrEmail: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}
export interface ResendOtpRequest {
  email: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
}

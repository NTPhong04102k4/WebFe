import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "src/shared/types/Request/auth/user";
import apiClient from "../../index";
import {
  LoginResponse,
  RegisterResponse,
  RegisterVerifyResponse,
  ResendOtpResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";
import { AdminLoginRequest } from "src/shared/types/Request/auth/admin";
import { AdminLoginResponse } from "src/shared/types/Reponse/auth/admin";
import { AUTH_ROUTES } from "./auth.routes";

export const authAPI = {
  // ─── User authentication ──────────────────────────────────────────────────
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>(AUTH_ROUTES.LOGIN, credentials),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>(AUTH_ROUTES.REGISTER, data),

  /**
   * Lấy thông tin profile theo username hoặc email.
   * Backend endpoint: GET /user/{gmailOrUserName}
   * Yêu cầu role: Customer (Bearer token)
   */
  getProfile: (usernameOrEmail: string) =>
    apiClient.get<UserResponse>(`/user/${encodeURIComponent(usernameOrEmail)}`),

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<RegisterVerifyResponse>(AUTH_ROUTES.VERIFY_OTP, data),

  resendOtp: (data: ResendOtpRequest) =>
    apiClient.post<ResendOtpResponse>(AUTH_ROUTES.RESEND_OTP, data),

  updateProfile: (data: FormData) =>
    apiClient.patch(AUTH_ROUTES.UPDATE_PROFILE, data),

  /**
   * Logout: revoke cả access token (JTI blacklist) + refresh token.
   */
  logout: (refreshToken?: string) =>
    apiClient.post(AUTH_ROUTES.LOGOUT, refreshToken ? { refreshToken } : {}),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post(AUTH_ROUTES.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post(AUTH_ROUTES.RESET_PASSWORD, data),

  // ─── Admin authentication ─────────────────────────────────────────────────
  adminLogin: (data: AdminLoginRequest) =>
    apiClient.post<AdminLoginResponse>(AUTH_ROUTES.ADMIN_LOGIN, data),

  adminLogout: () => apiClient.post("/auth/admin/logout"),

  userLogout: (refreshToken?: string) =>
    apiClient.post(AUTH_ROUTES.LOGOUT, refreshToken ? { refreshToken } : {}),
};

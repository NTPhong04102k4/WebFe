import {
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  VerifyOtpRequest,
} from "src/shared/types/Request/auth/user";
import apiClient from "../../index";
import {
  LoginResponse,
  RegisterResponse,
  RegisterVerifyResponse,
  ResendOtpResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user/input";
import { AdminLoginRequest } from "src/shared/types/Request/auth/admin";
import { AdminLoginResponse } from "src/shared/types/Reponse/auth/admin";

export const authAPI = {
  // user authentication
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", credentials),
  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>("/auth/register", data),
  logout: () => apiClient.post("/auth/logout"),
  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<RegisterVerifyResponse>("/auth/verify-otp", data),
  resendOtp: (data: ResendOtpRequest) =>
    apiClient.post<ResendOtpResponse>("/auth/resend-otp", data),
  getProfile: () => apiClient.get<UserResponse>("/user/detail"),
  // admin authentication
  adminLogin: (data: AdminLoginRequest) =>
    apiClient.post<AdminLoginResponse>("/auth/admin/login", data),
};

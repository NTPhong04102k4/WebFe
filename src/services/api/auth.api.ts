import api from './axiosInstance'
import type { OperationResult } from '@/services/types/common.types'
import type {
  TokenResponse,
  VerifyOtpResponse,
  AdminLoginResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  AdminLoginRequest,
  CreateStaffRequest,
} from '@/services/types/auth.types'

export const authApi = {
  login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<OperationResult>('/auth/register', data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<OperationResult<VerifyOtpResponse>>(
      '/auth/verify-otp',
      data
    ),

  resendOtp: (email: string) =>
    api.post<OperationResult>('/auth/resend-otp', { email }),

  logout: (refreshToken?: string) =>
    api.post<OperationResult>('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh-token', { refreshToken }),

  adminLogin: (data: AdminLoginRequest) =>
    api.post<AdminLoginResponse>('/auth/admin/login', data),

  createStaff: (data: CreateStaffRequest) =>
    api.post<OperationResult>('/auth/admin/staff/create', data),
}


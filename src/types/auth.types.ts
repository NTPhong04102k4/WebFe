export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string // role: Customer | Admin | SuperAdmin | Staff
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: {
    id: number
    username: string
    email: string
    fullName: string
    emailVerified: boolean
  }
}

export interface UserProfile {
  id: number
  username: string
  email: string
  fullName?: string
  phone?: string
  avatarPath?: string
  role: string
  isActive: boolean
}

export interface AdminLoginResponse {
  fullName: string
  token: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  fullName: string
  role: string
}

export interface LoginRequest {
  usernameOrPhoneOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface VerifyOtpRequest {
  email: string
  otpCode: string
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface CreateStaffRequest {
  username: string
  email: string
  password: string
  fullName: string
  phone: string
  locationID: number
  roleID: number
  createBy: number
}

import axios, { AxiosInstance, AxiosResponse } from "axios";

import { ENV } from "../config/environment";

// API Configuration
const API_BASE_URL = ENV.API_URL || "https://localhost:7250";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Types
export interface LoginRequest {
  usernameOrPhoneOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email: string;
    name?: string;
  };
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
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

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
  };
}

// API Services
export class AuthService {
  // User Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      // Store token
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  }

  // Admin Authentication
  static async adminLogin(
    credentials: AdminLoginRequest
  ): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>(
        "/auth/admin/login",
        credentials
      );

      // Store token
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đăng nhập admin thất bại"
      );
    }
  }

  // Google OAuth
  static async googleLogin(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  }

  // Facebook OAuth
  static async facebookLogin(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/login/facebook`;
  }

  // User Registration
  static async register(
    credentials: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  }

  // Verify OTP
  static async verifyOtp(
    otpData: VerifyOtpRequest
  ): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>(
        "/auth/verify-otp",
        otpData
      );

      // Store token if verification successful
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Xác thực OTP thất bại");
    }
  }

  // Resend OTP
  static async resendOtp(
    emailData: ResendOtpRequest
  ): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        "/auth/resend-otp",
        emailData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Không thể gửi lại mã OTP"
      );
    }
  }

  // Logout
  static logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  }

  // Get current user from token
  static getCurrentUser(): any {
    const userStr = localStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("auth_user");
    return !!(token && user);
  }

  // Clear all authentication storage
  static clearStorage(): void {
    console.log("🧹 Clearing all authentication storage...");

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    // Clear sessionStorage
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");

    // Clear any other potential storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("auth") || key.includes("token") || key.includes("user"))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed localStorage key: ${key}`);
    });

    console.log("✅ All authentication storage cleared");
  }
}

// Export the API client for other services
export default apiClient;

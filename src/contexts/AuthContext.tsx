import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { googleAuthRealService } from "../services/googleAuthReal";
import { facebookAuthRealService } from "../services/facebookAuthReal";
import { AuthService, LoginRequest } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: "google" | "facebook" | "email";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  verifyOtp: (email: string, otpCode: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  clearStorage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser && AuthService.isAuthenticated()) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
  };

  const loginWithGoogle = async () => {
    console.log("🚀 loginWithGoogle function called!");
    setIsLoading(true);
    try {
      console.log("🔍 Starting real Google login...");

      // Use real Google OAuth
      const googleUser = await googleAuthRealService.loginWithGoogle();

      const user: User = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        provider: "google",
      };
      console.log("📝 User object created:", user);

      // Store JWT token if available
      if (googleUser.tokens?.access_token) {
        localStorage.setItem("auth_token", googleUser.tokens.access_token);
      }

      setUser(user);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("✅ Google login completed successfully:", user);
    } catch (error) {
      console.error("❌ Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("🏁 Google login process finished");
    }
  };

  const loginWithFacebook = async () => {
    console.log("🚀 loginWithFacebook function called!");
    setIsLoading(true);
    try {
      console.log("🔍 Starting real Facebook login...");

      // Use real Facebook OAuth
      const facebookUser = await facebookAuthRealService.loginWithFacebook();

      const user: User = {
        id: facebookUser.id,
        name: facebookUser.name,
        email: facebookUser.email,
        picture: facebookUser.picture,
        provider: "facebook",
      };
      console.log("📝 User object created:", user);

      // Store JWT token if available
      if (facebookUser.tokens?.access_token) {
        localStorage.setItem("auth_token", facebookUser.tokens.access_token);
      }

      setUser(user);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("✅ Facebook login completed successfully:", user);
    } catch (error) {
      console.error("❌ Facebook login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("🏁 Facebook login process finished");
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginRequest: LoginRequest = {
        usernameOrPhoneOrEmail: email,
        password: password,
      };

      const response = await AuthService.login(loginRequest);

      const user: User = {
        id: "email_" + Date.now(),
        name: email.split("@")[0],
        email: email,
        provider: "email",
      };

      setUser(user);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("Email login completed successfully:", user);
    } catch (error: any) {
      console.error("Email login failed:", error);
      throw new Error(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({
        username: name,
        email: email,
        password: password,
      });

      console.log("Registration request sent successfully:", response);
      // Don't set user yet, wait for OTP verification
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.verifyOtp({
        email: email,
        otpCode: otpCode,
      });

      const user: User = {
        id: response.user?.id || "email_" + Date.now(),
        name: response.user?.fullName || email.split("@")[0],
        email: email,
        provider: "email",
      };

      // Store JWT token
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }

      setUser(user);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("OTP verification completed successfully:", user);
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      throw new Error(error.message || "Xác thực OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const response = await AuthService.resendOtp({
        email: email,
      });
      console.log("Resend OTP request sent successfully:", response);
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      throw new Error(error.message || "Không thể gửi lại mã OTP");
    }
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
    console.log("User logged out successfully");
  };

  const clearStorage = () => {
    console.log("🧹 Clearing all authentication storage...");

    // Clear localStorage
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");

    // Clear sessionStorage
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");

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

    // Reset user state
    setUser(null);

    console.log("✅ All authentication storage cleared successfully");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    verifyOtp,
    resendOtp,
    logout,
    initializeAuth,
    clearStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/common/utils/logger";
import { TabNavigation, MessageDisplay } from "../../shared/components/Login";
import { LoginContent } from "./components/LoginContent";
import { useAuthQuery } from "src/query/auth/useAuthQuery";
import {
  LoginFormData,
  RegisterFormData,
} from "src/shared/validation/authSchemas";
import { useAppSelector } from "src/redux/hook";
import { selectAuth } from "src/redux/Slice/AuthSlice";
import { useSocialLogin } from "src/shared/hooks/auth/useSocialLogin";

export default function Login() {
  const navigate = useNavigate();
  const authState = useAppSelector(selectAuth);
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  useEffect(() => {
    logger.log("🔐 AUTH STORE STATE", {
      token: authState.token,
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
    });
  }, [authState]);

  const {
    verifyOtpAsync,
    resendOtpAsync,
    loginAsync,
    registerAsync,
    isLoginLoading,
    isRegisterLoading,
    isVerifyOtpLoading,
    isResendOtpLoading,
  } = useAuthQuery();

  // Social login hook
  const { handleGoogleLogin, handleFacebookLogin } = useSocialLogin({
    isLogin,
    onError: setError,
    onSuccess: setSuccess,
  });

  // Initialize isLogin based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/auth/signUp") {
      setIsLogin(false);
    } else if (path === "/auth/signin") {
      setIsLogin(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "oauth_failed") {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  }, []);

  // Update URL when switching tabs
  useEffect(() => {
    const newPath = isLogin ? "/auth/signin" : "/auth/signUp";
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, "", newPath);
    }
  }, [isLogin]);

  // Clear error when switching tabs
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [isLogin]);

  const handleLogin = async (data: LoginFormData) => {
    setError("");
    try {
      const res = await loginAsync({
        usernameOrPhoneOrEmail: data.email,
        password: data.password,
      });
      logger.log(res.data.message);
      setSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || error?.message || "Đăng nhập thất bại"
      );
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setError("");
    setEmail(data.email);
    try {
      await registerAsync({
        username: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
      setShowOtpVerification(true);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || error?.message || "Đăng ký thất bại"
      );
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setError("");
    try {
      await verifyOtpAsync({
        email: email,
        otpCode: otpCode,
      });
      setSuccess("Đăng ký thành công! Chào mừng bạn đến với SoldCars!");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Xác thực OTP thất bại"
      );
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setError("");
    try {
      await resendOtpAsync({
        email: email,
      });
      setSuccess("Mã OTP mới đã được gửi đến email của bạn!");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi lại mã OTP"
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpVerification(false);
    setError("");
    setSuccess("");
  };

  const handleToggleTab = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="flex flex-1 w-[100%] self-center flex-col bg-[#050b2b]">
      <div className="rounded-3xl flex flex-col flex-1 w-full bg-white pb-20">
        <div className="flex self-center w-[30%] 2xl:w-1/4 flex-col pt-9">
          <TabNavigation isLogin={isLogin} onToggle={handleToggleTab} />

          <MessageDisplay error={error} success={success} />
          <div className="">
            <LoginContent
              isLogin={isLogin}
              showOtpVerification={showOtpVerification}
              email={email}
              error={error}
              success={success}
              isResendingOtp={isResendingOtp}
              isLoginLoading={isLoginLoading}
              isRegisterLoading={isRegisterLoading}
              isVerifyOtpLoading={isVerifyOtpLoading}
              isResendOtpLoading={isResendOtpLoading}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              onBackToRegister={handleBackToRegister}
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              onGoogleError={() =>
                setError(
                  isLogin
                    ? "Đăng nhập Google thất bại. Vui lòng thử lại."
                    : "Đăng ký Google thất bại. Vui lòng thử lại."
                )
              }
              onFacebookError={() =>
                setError(
                  isLogin
                    ? "Đăng nhập Facebook thất bại. Vui lòng thử lại."
                    : "Đăng ký Facebook thất bại. Vui lòng thử lại."
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
import { Theme } from "src/shared/components/footer/data";
import {
  TabNavigation,
  MessageDisplay,
  LoginForm,
  RegisterForm,
  SocialLoginButtons,
} from "../../shared/components/Login";
import { OtpVerificationForm } from "../../shared/components/Login/OtpVerificationForm";
import { useAuthQuery } from "src/query/auth/useAuthQuery";
import { googleAuthRealService } from "src/shared/hooks/auth/googleAuthReal";
import { facebookAuthRealService } from "src/shared/hooks/auth/facebookAuthReal";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isHide, setIsHide] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResendingOtp, setIsResendingOtp] = useState(false);

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "oauth_failed") {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    try {
      const res = await loginAsync({
        usernameOrPhoneOrEmail: formData.email,
        password: formData.password,
      });
      console.log(res);
      setSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || error?.message || "Đăng nhập thất bại"
      );
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    try {
      await registerAsync({
        username: formData.name,
        email: formData.email,
        password: formData.password,
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
        email: formData.email,
        otpCode: otpCode,
      });
      setSuccess("Đăng ký thành công! Chào mừng bạn đến với SoldCars!");
      setTimeout(() => {
        window.location.href = "/";
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
        email: formData.email,
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

  const handleGoogleLogin = async () => {
    console.log("🎯 handleGoogleLogin called from login page!");
    setError("");
    try {
      const googleUser = await googleAuthRealService.loginWithGoogle();
      console.log("Google user:", googleUser);
      const message = isLogin
        ? "Đăng nhập Google thành công!"
        : "Đăng ký Google thành công!";
      setSuccess(message);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isLogin
          ? "Đăng nhập Google thất bại. Vui lòng thử lại."
          : "Đăng ký Google thất bại. Vui lòng thử lại.");
      setError(errorMessage);
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    try {
      const facebookUser = await facebookAuthRealService.loginWithFacebook();
      console.log("Facebook user:", facebookUser);
      const message = isLogin
        ? "Đăng nhập Facebook thành công!"
        : "Đăng ký Facebook thành công!";
      setSuccess(message);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isLogin
          ? "Đăng nhập Facebook thất bại. Vui lòng thử lại."
          : "Đăng ký Facebook thất bại. Vui lòng thử lại.");
      setError(errorMessage);
    }
  };

  return (
    <div className="flex flex-1 w-[90%] self-center flex-col bg-[#050b2b]">
      <Header />
      <div className="rounded-3xl flex flex-col flex-1 w-full bg-white pb-20">
        <div className="flex self-center w-[30%] 2xl:w-1/4 flex-col">
          <TabNavigation
            isLogin={isLogin}
            onToggle={() => setIsLogin((prev) => !prev)}
          />

          <MessageDisplay error={error} success={success} />

          {showOtpVerification ? (
            <OtpVerificationForm
              email={formData.email}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              onBack={handleBackToRegister}
              isLoading={isVerifyOtpLoading}
              isResending={isResendOtpLoading || isResendingOtp}
              error={error}
            />
          ) : isLogin ? (
            <>
              <LoginForm
                formData={formData}
                onInputChange={handleInputChange}
                onLogin={handleLogin}
                isLoading={isLoginLoading}
                isHide={isHide}
                onToggleHide={() => setIsHide((prev) => !prev)}
              />
              <SocialLoginButtons
                onGoogleSuccess={handleGoogleLogin}
                onGoogleError={() =>
                  setError("Đăng nhập Google thất bại. Vui lòng thử lại.")
                }
                onFacebookSuccess={handleFacebookLogin}
                onFacebookError={() =>
                  setError("Đăng nhập Facebook thất bại. Vui lòng thử lại.")
                }
                isLogin={true}
              />
            </>
          ) : (
            <>
              <RegisterForm
                formData={formData}
                onInputChange={handleInputChange}
                onRegister={handleRegister}
                isLoading={isRegisterLoading}
                isHide={isHide}
                onToggleHide={() => setIsHide((prev) => !prev)}
              />
              <SocialLoginButtons
                onGoogleSuccess={handleGoogleLogin}
                onGoogleError={() =>
                  setError("Đăng ký Google thất bại. Vui lòng thử lại.")
                }
                onFacebookSuccess={handleFacebookLogin}
                onFacebookError={() =>
                  setError("Đăng ký Facebook thất bại. Vui lòng thử lại.")
                }
                isLogin={false}
              />
            </>
          )}
        </div>
      </div>
      <FooterComponent theme={Theme.DARK} />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { Theme } from "src/shared/components/footer/data";
import {
  TabNavigation,
  MessageDisplay,
  LoginForm,
  RegisterForm,
  SocialLoginButtons,
} from "../../shared/components/Login";
import { OtpVerificationForm } from "../../shared/components/Login/OtpVerificationForm";
import { log } from "console";

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
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    verifyOtp,
    resendOtp,
    isLoading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  // Check for OAuth errors
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

    try {
      await loginWithEmail(formData.email, formData.password);
      setSuccess("Đăng nhập thành công!");
    } catch (error: any) {
      setError(error.message || "Đăng nhập thất bại");
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    console.log("🔄 handleRegister called from login page!");
    console.log("🔄 formData:", formData);
    try {
      await registerWithEmail(formData.name, formData.email, formData.password);
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
      setShowOtpVerification(true);
    } catch (error: any) {
      setError(error.message || "Đăng ký thất bại");
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    try {
      await verifyOtp(formData.email, otpCode);
      setSuccess("Đăng ký thành công! Chào mừng bạn đến với SoldCars!");
      // Redirect to home page after successful registration
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Xác thực OTP thất bại");
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await resendOtp(formData.email);
      setSuccess("Mã OTP mới đã được gửi đến email của bạn!");
    } catch (error: any) {
      setError(error.message || "Không thể gửi lại mã OTP");
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
      console.log("🔄 Calling loginWithGoogle from page...");
      await loginWithGoogle();
      console.log("✅ loginWithGoogle completed, setting success message");
      const message = isLogin
        ? "Đăng nhập Google thành công!"
        : "Đăng ký Google thành công!";
      setSuccess(message);
    } catch (error) {
      console.error("❌ Error in handleGoogleLogin:", error);
      const errorMessage = isLogin
        ? "Đăng nhập Google thất bại. Vui lòng thử lại."
        : "Đăng ký Google thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    }
  };

  const handleFacebookLogin = async () => {
    console.log("🎯 handleFacebookLogin called from login page!");
    setError("");
    try {
      console.log("🔄 Calling loginWithFacebook from page...");
      await loginWithFacebook();
      console.log("✅ loginWithFacebook completed, setting success message");
      const message = isLogin
        ? "Đăng nhập Facebook thành công!"
        : "Đăng ký Facebook thành công!";
      setSuccess(message);
    } catch (error) {
      console.error("❌ Error in handleFacebookLogin:", error);
      const errorMessage = isLogin
        ? "Đăng nhập Facebook thất bại. Vui lòng thử lại."
        : "Đăng ký Facebook thất bại. Vui lòng thử lại.";
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
              isLoading={isLoading}
              isResending={isResendingOtp}
              error={error}
            />
          ) : isLogin ? (
            <>
              <LoginForm
                formData={formData}
                onInputChange={handleInputChange}
                onLogin={handleLogin}
                isLoading={isLoading}
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
                isLoading={isLoading}
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

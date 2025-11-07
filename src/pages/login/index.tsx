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
import {
  LoginFormData,
  RegisterFormData,
} from "src/shared/validation/authSchemas";
import { useAppDispatch } from "src/redux/hook";
import { setCredentials } from "src/redux/Slice/AuthSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [email, setEmail] = useState("");
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
      console.log(res.data.message);
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

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const googleUser = await googleAuthRealService.loginWithGoogle();
      console.log("Google user:", googleUser);

      const token = googleUser.tokens?.access_token || "";
      const user = googleUser;

      if (token && user) {
        const mappedUser = {
          userID: parseInt(user.id) || 0,
          userUUID: user.id || "",
          userCode: user.id || "",
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ").slice(1).join(" ") || "",
          fullName: user.name || "",
          dateOfBirth: null,
          gender: "",
          identityNumber: "",
          phone: "",
          email: user.email || "",
          address: "",
          username: user.email?.split("@")[0] || "",
          passwordHash: "",
          passwordSalt: "",
          emailVerified: user.verified_email || false,
          phoneVerified: false,
          idSocial: user.id || "",
          lastLoginDate: new Date(),
          loginAttempts: 0,
          isLocked: false,
          lockUntil: null,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          image: user.picture || "",
        } as any;

        dispatch(
          setCredentials({
            token: token,
            user: mappedUser,
          })
        );

        const message = isLogin
          ? "Đăng nhập Google thành công!"
          : "Đăng ký Google thành công!";
        setSuccess(message);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error("Không nhận được token từ Google");
      }
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

      const token = facebookUser.tokens?.access_token || "";
      const apiUser = (facebookUser as any).user || facebookUser;

      if (apiUser && (apiUser.UserID || apiUser.userID)) {
        const userData = {
          userID: apiUser.UserID || apiUser.userID,
          userUUID: apiUser.userUUID || apiUser.UserUUID || "",
          userCode: apiUser.userCode || apiUser.UserCode || "",
          firstName: apiUser.FirstName || apiUser.firstName || "",
          lastName: apiUser.LastName || apiUser.lastName || "",
          fullName: apiUser.FullName || apiUser.fullName || "",
          dateOfBirth: apiUser.DateOfBirth
            ? new Date(apiUser.DateOfBirth)
            : null,
          gender: apiUser.Gender || apiUser.gender || "",
          identityNumber:
            apiUser.IdentityNumber || apiUser.identityNumber || "",
          phone: apiUser.Phone || apiUser.phone || "",
          email: apiUser.Email || apiUser.email || "",
          address: apiUser.Address || apiUser.address || "",
          username: apiUser.Username || apiUser.username || "",
          passwordHash: "",
          passwordSalt: "",
          emailVerified: apiUser.emailVerified || false,
          phoneVerified: apiUser.phoneVerified || false,
          idSocial: apiUser.id || "",
          lastLoginDate: new Date(),
          loginAttempts: 0,
          isLocked: apiUser.isLocked || false,
          lockUntil: null,
          isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
          createdDate: new Date(),
          updatedDate: new Date(),
          image: apiUser.Image || apiUser.image || apiUser.picture || "",
        } as any;

        dispatch(
          setCredentials({
            token: token,
            user: userData,
          })
        );

        const message = isLogin
          ? "Đăng nhập Facebook thành công!"
          : "Đăng ký Facebook thành công!";
        setSuccess(message);
        setTimeout(() => {
          window.location.href = "/";
        }, 50);
      } else if (token) {
        const mappedUser = {
          userID: 0,
          userUUID: facebookUser.id || "",
          userCode: facebookUser.id || "",
          firstName: facebookUser.name?.split(" ")[0] || "",
          lastName: facebookUser.name?.split(" ").slice(1).join(" ") || "",
          fullName: facebookUser.name || "",
          dateOfBirth: null,
          gender: facebookUser.gender || "",
          identityNumber: "",
          phone: "",
          email: facebookUser.email || "",
          address: "",
          username: facebookUser.email?.split("@")[0] || "",
          passwordHash: "",
          passwordSalt: "",
          emailVerified: false,
          phoneVerified: false,
          idSocial: facebookUser.id || "",
          lastLoginDate: new Date(),
          loginAttempts: 0,
          isLocked: false,
          lockUntil: null,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          image: facebookUser.picture || "",
        } as any;

        dispatch(
          setCredentials({
            token: token,
            user: mappedUser,
          })
        );

        const message = isLogin
          ? "Đăng nhập Facebook thành công!"
          : "Đăng ký Facebook thành công!";
        setSuccess(message);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error("Không nhận được token từ Facebook");
      }
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
        <div className="flex self-center w-[30%] 2xl:w-1/4 flex-col pt-9">
          <TabNavigation isLogin={isLogin} onToggle={handleToggleTab} />

          <MessageDisplay error={error} success={success} />
          <div className="">
            {showOtpVerification ? (
              <OtpVerificationForm
                email={email}
                onVerifyOtp={handleVerifyOtp}
                onResendOtp={handleResendOtp}
                onBack={handleBackToRegister}
                isLoading={isVerifyOtpLoading}
                isResending={isResendOtpLoading || isResendingOtp}
                error={error}
              />
            ) : isLogin ? (
              <>
                <LoginForm onLogin={handleLogin} isLoading={isLoginLoading} />
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
                  onRegister={handleRegister}
                  isLoading={isRegisterLoading}
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
      </div>
      <FooterComponent theme={Theme.DARK} />
    </div>
  );
}

import React from "react";
import {
  LoginForm,
  RegisterForm,
  SocialLoginButtons,
} from "src/shared/components/Login";
import { OtpVerificationForm } from "src/shared/components/Login/OtpVerificationForm";
import {
  LoginFormData,
  RegisterFormData,
} from "src/shared/validation/authSchemas";

interface LoginContentProps {
  isLogin: boolean;
  showOtpVerification: boolean;
  email: string;
  error: string;
  success: string;
  isResendingOtp: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isVerifyOtpLoading: boolean;
  isResendOtpLoading: boolean;
  onLogin: (data: LoginFormData) => void;
  onRegister: (data: RegisterFormData) => void;
  onVerifyOtp: (otpCode: string) => void;
  onResendOtp: () => void;
  onBackToRegister: () => void;
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  onGoogleError: () => void;
  onFacebookError: () => void;
}

export const LoginContent: React.FC<LoginContentProps> = ({
  isLogin,
  showOtpVerification,
  email,
  error,
  success,
  isResendingOtp,
  isLoginLoading,
  isRegisterLoading,
  isVerifyOtpLoading,
  isResendOtpLoading,
  onLogin,
  onRegister,
  onVerifyOtp,
  onResendOtp,
  onBackToRegister,
  onGoogleLogin,
  onFacebookLogin,
  onGoogleError,
  onFacebookError,
}) => {
  if (showOtpVerification) {
    return (
      <OtpVerificationForm
        email={email}
        onVerifyOtp={onVerifyOtp}
        onResendOtp={onResendOtp}
        onBack={onBackToRegister}
        isLoading={isVerifyOtpLoading}
        isResending={isResendOtpLoading || isResendingOtp}
        error={error}
      />
    );
  }

  if (isLogin) {
    return (
      <>
        <LoginForm onLogin={onLogin} isLoading={isLoginLoading} />
        <SocialLoginButtons
          onGoogleSuccess={onGoogleLogin}
          onGoogleError={onGoogleError}
          onFacebookSuccess={onFacebookLogin}
          onFacebookError={onFacebookError}
          isLogin={true}
        />
      </>
    );
  }

  return (
    <>
      <RegisterForm onRegister={onRegister} isLoading={isRegisterLoading} />
      <SocialLoginButtons
        onGoogleSuccess={onGoogleLogin}
        onGoogleError={onGoogleError}
        onFacebookSuccess={onFacebookLogin}
        onFacebookError={onFacebookError}
        isLogin={false}
      />
    </>
  );
};

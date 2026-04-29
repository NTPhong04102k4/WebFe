import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/common/utils/logger";
import { useGoogleAuth } from "./useGoogleAuth";
import { useFacebookAuth } from "./useFacebookAuth";
import { useSocialAuthMapper } from "./useSocialAuthMapper";
import { useAuthStore } from "@/stores/authStore";
import {
  isBackendUserResponse,
  isFacebookUserResponse,
  isGoogleUserResponse,
  toAuthUserFromBackend,
  toAuthUserFromFacebook,
  toAuthUserFromGoogle,
} from "./socialGuards";
import { getRolesFromToken } from "src/services/decode";

interface UseSocialLoginOptions {
  isLogin: boolean;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export const useSocialLogin = ({
  isLogin,
  onError,
  onSuccess,
}: UseSocialLoginOptions) => {
  const navigate = useNavigate();
  const { mapGoogleUser, mapFacebookUser } = useSocialAuthMapper();
  const { loginWithGoogle: googleLogin } = useGoogleAuth();
  const { loginWithFacebook: facebookLogin } = useFacebookAuth();
  const [isLoading, setIsLoading] = useState(false);

  const saveCredentialsAndLog = (
    token: string,
    user: ReturnType<typeof useAuthStore.getState>["user"],
    type: "GOOGLE" | "FACEBOOK"
  ) => {
    const roles = getRolesFromToken(token);
    logger.log("🔍 [Social Login] Token roles:", roles, "User:", user);

    // Zustand migration: lưu access/refresh + user vào store
    const refreshToken = useAuthStore.getState().refreshToken ?? "";
    useAuthStore.getState().setTokens(token, refreshToken);
    if (user) {
      useAuthStore.getState().setUser(user);
    }

    const message = isLogin
      ? `Đăng nhập ${type === "GOOGLE" ? "Google" : "Facebook"} thành công!`
      : `Đăng ký ${type === "GOOGLE" ? "Google" : "Facebook"} thành công!`;

    onSuccess?.(message);

    const isSuperAdmin = roles.some((r) => r.toLowerCase() === "superadmin");
    logger.log("🔍 [Social Login] Is SuperAdmin:", isSuperAdmin);

    setTimeout(() => {
      if (isSuperAdmin) {
        navigate("/auth/login/admin/page_manage", { replace: true });
      } else {
        logger.log("Regular user, navigating to home");
        navigate("/", { replace: true });
      }
    }, 3000);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const googleUser = await googleLogin();
      const token = googleUser.tokens?.access_token || "";

      if (!token) {
        throw new Error("Không nhận được token từ Google");
      }

      const user = isBackendUserResponse(googleUser)
        ? toAuthUserFromBackend(googleUser, token)
        : isGoogleUserResponse(googleUser)
          ? toAuthUserFromGoogle(googleUser, token)
          : mapGoogleUser(googleUser, token);

      saveCredentialsAndLog(token, user, "GOOGLE");
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isLogin
          ? "Đăng nhập Google thất bại. Vui lòng thử lại."
          : "Đăng ký Google thất bại. Vui lòng thử lại.");
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const facebookUser = await facebookLogin();

      const token = facebookUser.tokens?.access_token || "";

      if (!token) {
        throw new Error("Không nhận được token từ Facebook");
      }

      const user = isBackendUserResponse(facebookUser)
        ? toAuthUserFromBackend(facebookUser, token)
        : isFacebookUserResponse(facebookUser)
          ? toAuthUserFromFacebook(facebookUser, token)
          : mapFacebookUser(facebookUser, token);

      saveCredentialsAndLog(token, user, "FACEBOOK");
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (isLogin
          ? "Đăng nhập Facebook thất bại. Vui lòng thử lại."
          : "Đăng ký Facebook thất bại. Vui lòng thử lại.");
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
    isLoading,
  };
};

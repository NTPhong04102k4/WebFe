import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/common/utils/logger";
import { useGoogleAuth } from "./useGoogleAuth";
import { useFacebookAuth } from "./useFacebookAuth";
import { useSocialAuthMapper } from "./useSocialAuthMapper";
import {
  FacebookUserResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";
import { getTokenClaims } from "src/services/decode";
import { useAuthStore } from "@/stores/authStore";

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
    userData: any,
    type: "GOOGLE" | "FACEBOOK"
  ) => {
    const normalizedRoles = getTokenClaims(token)?.sub;
    const userWithRoles = {
      ...userData,
      roles: normalizedRoles,
    };

    logger.log("🔍 [Social Login] Token roles:", normalizedRoles, "User:", userWithRoles);

    // Zustand migration: lưu access/refresh + user vào store
    const refreshToken = useAuthStore.getState().refreshToken ?? "";
    useAuthStore.getState().setTokens(token, refreshToken);
    useAuthStore.getState().setUser(userWithRoles as any);

    const message = isLogin
      ? `Đăng nhập ${type === "GOOGLE" ? "Google" : "Facebook"} thành công!`
      : `Đăng ký ${type === "GOOGLE" ? "Google" : "Facebook"} thành công!`;

    onSuccess?.(message);

    const isSuperAdmin = normalizedRoles?.includes("superadmin");
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

      const isBackendUserData =
        (googleUser as any).userID !== undefined ||
        (googleUser as any).userUUID !== undefined;

      let userData: any;
      if (isBackendUserData) {
        userData = googleUser as unknown as UserResponse;
      } else {
        userData = mapGoogleUser(googleUser);
      }

      saveCredentialsAndLog(token, userData, "GOOGLE");
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
      const apiUser = (facebookUser as any).user || facebookUser;

      if (!token) {
        throw new Error("Không nhận được token từ Facebook");
      }

      const isBackendUserData =
        (apiUser as any).userID !== undefined ||
        (apiUser as any).userUUID !== undefined;

      let userData: any;
      if (isBackendUserData) {
        userData = apiUser as unknown as UserResponse;
      } else {
        userData = mapFacebookUser(
          (apiUser as any).userID
            ? (apiUser as FacebookUserResponse)
            : (facebookUser as any)
        );
        logger.log("Mapped social auth response");
      }

      saveCredentialsAndLog(token, userData, "FACEBOOK");
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

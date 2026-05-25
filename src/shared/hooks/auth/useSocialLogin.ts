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

  /**
   * Lưu token + user vào store và điều hướng theo role.
   */
  const saveAndNavigate = (
    token: string,
    user: ReturnType<typeof useAuthStore.getState>["user"],
    provider: "GOOGLE" | "FACEBOOK"
  ) => {
    const roles = getRolesFromToken(token);
    const refreshToken = useAuthStore.getState().refreshToken ?? "";

    useAuthStore.getState().setTokens(token, refreshToken);
    if (user) {
      useAuthStore.getState().setUser(user);
    }

    const label = provider === "GOOGLE" ? "Google" : "Facebook";
    const message = isLogin
      ? `Đăng nhập ${label} thành công!`
      : `Đăng ký ${label} thành công!`;

    onSuccess?.(message);
    logger.log(`✅ [Social Login] ${label} — roles:`, roles);

    const isAdmin = roles.some((r) =>
      ["admin", "superadmin", "staff"].includes(r.toLowerCase())
    );

    // Navigate ngay — không cần setTimeout
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  // ─── Google ────────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const googleUser = await googleLogin();
      const token = googleUser.tokens?.access_token ?? "";

      if (!token) {
        throw new Error("Không nhận được token từ Google");
      }

      const user = isBackendUserResponse(googleUser)
        ? toAuthUserFromBackend(googleUser, token)
        : isGoogleUserResponse(googleUser)
          ? toAuthUserFromGoogle(googleUser, token)
          : mapGoogleUser(googleUser, token);

      saveAndNavigate(token, user, "GOOGLE");
    } catch (error: any) {
      const errorMessage =
        error?.message ??
        (isLogin
          ? "Đăng nhập Google thất bại. Vui lòng thử lại."
          : "Đăng ký Google thất bại. Vui lòng thử lại.");
      logger.error("[Social Login] Google error:", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Facebook ──────────────────────────────────────────────────────────────
  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const facebookUser = await facebookLogin();
      const token = facebookUser.tokens?.access_token ?? "";

      if (!token) {
        throw new Error("Không nhận được token từ Facebook");
      }

      const user = isBackendUserResponse(facebookUser)
        ? toAuthUserFromBackend(facebookUser, token)
        : isFacebookUserResponse(facebookUser)
          ? toAuthUserFromFacebook(facebookUser, token)
          : mapFacebookUser(facebookUser, token);

      saveAndNavigate(token, user, "FACEBOOK");
    } catch (error: any) {
      const errorMessage =
        error?.message ??
        (isLogin
          ? "Đăng nhập Facebook thất bại. Vui lòng thử lại."
          : "Đăng ký Facebook thất bại. Vui lòng thử lại.");
      logger.error("[Social Login] Facebook error:", errorMessage);
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

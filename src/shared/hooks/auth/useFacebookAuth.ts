import { useCallback, useState } from "react";
import type { FacebookUserResponse } from "src/shared/types/Reponse/auth/user";
import { openSocialAuthPopup } from "./socialPopup";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Hook đăng nhập Facebook qua backend OAuth popup flow.
 *
 * Không dùng Facebook JS SDK — toàn bộ OAuth được xử lý phía backend.
 * Frontend chỉ mở popup đến `/auth/login/facebook`, backend xử lý
 * challenge → callback → postMessage JWT token về window.opener.
 */
export const useFacebookAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithFacebook = useCallback(async (): Promise<FacebookUserResponse> => {
    try {
      setIsLoading(true);
      const result = await openSocialAuthPopup("facebook");
      return {
        ...(isRecord(result.user) ? result.user : {}),
        tokens: result.tokens,
      } as FacebookUserResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loginWithFacebook,
    isLoading,
  };
};

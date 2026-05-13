import { useCallback, useState } from "react";
import type { GoogleUserResponse } from "src/shared/types/Reponse/auth/user";
import { openSocialAuthPopup } from "./socialPopup";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useCallback(async (): Promise<GoogleUserResponse> => {
    try {
      setIsLoading(true);
      const result = await openSocialAuthPopup("google");
      return {
        ...(isRecord(result.user) ? result.user : {}),
        tokens: result.tokens,
      } as GoogleUserResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loginWithGoogle,
    isLoading,
  };
};

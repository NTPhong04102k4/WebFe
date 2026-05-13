import { useCallback, useEffect, useRef, useState } from "react";
import { ENV } from "src/config/environment";
import type { FacebookUserResponse } from "src/shared/types/Reponse/auth/user";
import { logger } from "@/common/utils/logger";
import { openSocialAuthPopup } from "./socialPopup";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export const useFacebookAuth = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSDKInitialized = useRef(false);

  const initFacebookSDK = useCallback(() => {
    if (typeof window !== "undefined" && window.FB) {
      window.FB.init({
        appId: ENV.FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      logger.log("Facebook SDK initialized");
    }
  }, []);

  useEffect(() => {
    if (isSDKInitialized.current || isSDKLoaded) return;

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      setIsSDKLoaded(true);
      initFacebookSDK();
    };

    script.onerror = () => {
      logger.error("Failed to load Facebook SDK");
    };

    document.head.appendChild(script);
    isSDKInitialized.current = true;
  }, [isSDKLoaded, initFacebookSDK]);

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
    isSDKLoaded,
  };
};

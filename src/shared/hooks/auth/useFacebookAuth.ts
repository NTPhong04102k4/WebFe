import { useState, useEffect, useCallback, useRef } from "react";
import { ENV } from "src/config/environment";
import { AUTH_ROUTES } from "src/services/api/functions/auth/auth.routes";
import { FacebookUserResponse } from "src/shared/types/Reponse/auth/user";
import { logger } from "@/common/utils/logger";
import type {
  OAuthErrorMessage,
  OAuthSuccessMessage,
  FacebookLoginErrorMessage,
  FacebookLoginSuccessMessage,
  SocialAuthMessage,
  SocialAuthResult,
  SocialTokens,
} from "./socialPopup.types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export const useFacebookAuth = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSDKInitialized = useRef(false);

  const initFacebookSDK = useCallback(() => {
    if (typeof window !== "undefined" && window.FB) {
      const FB = window.FB;

      FB.init({
        appId: ENV.FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      logger.log("✅ Facebook SDK initialized");
    }
  }, []);

  // Initialize Facebook SDK
  useEffect(() => {
    if (isSDKInitialized.current || isSDKLoaded) return;

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      logger.log("✅ Facebook SDK loaded successfully");
      setIsSDKLoaded(true);
      initFacebookSDK();
    };

    script.onerror = () => {
      logger.error("❌ Failed to load Facebook SDK");
    };

    document.head.appendChild(script);
    isSDKInitialized.current = true;

    return () => {
      // Cleanup if needed
    };
  }, [isSDKLoaded, initFacebookSDK]);

  const loginWithFacebook = useCallback((): Promise<FacebookUserResponse> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const baseApiUrl = (ENV.API_URL || "").replace(/\/$/, "");
      const authUrl = `${baseApiUrl}${AUTH_ROUTES.FACEBOOK_LOGIN}`;

      if (!baseApiUrl) {
        setIsLoading(false);
        reject(new Error("Thiếu cấu hình VITE_API_BASE_URL cho social login"));
        return;
      }

      const popup = window.open(
        authUrl,
        "facebook-login",
        "width=500,height=600,scrollbars=yes,resizable=yes,popup=yes",
      );

      if (!popup) {
        setIsLoading(false);
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      let resolved = false;

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkInterval);
        setIsLoading(false);
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch (error) {
          logger.error("Error closing popup:", error);
        }
      };

      const handleSuccess = (result: SocialAuthResult) => {
        if (resolved) return;
        resolved = true;
        logger.log("🎉 Real Facebook Login Success!", {
          userData: result.user,
          tokens: result.tokens,
        });
        cleanup();
        resolve({
          ...(isRecord(result.user) ? result.user : {}),
          tokens: result.tokens,
        });
      };

      const handleError = (error: string) => {
        if (resolved) return;
        resolved = true;
        logger.error("❌ Facebook login error:", error);
        cleanup();
        reject(new Error(error));
      };

      // Check popup closed status periodically
      // Note: We can't access popup.location.href when cross-origin due to COOP policy
      // So we rely primarily on postMessage from the backend
      const checkInterval = setInterval(() => {
        try {
          // Check if popup is closed (may throw if cross-origin)
          if (popup.closed) {
            if (!resolved) {
              cleanup();
              reject(new Error("Popup was closed by user"));
            }
            return;
          }
        } catch (error) {
          // Cross-origin error when checking popup.closed is expected
          // We'll rely on postMessage and timeout instead
          // Don't reject here as the popup might still be processing
        }
      }, 500);

      const messageListener = (event: MessageEvent) => {
        const data: SocialAuthMessage | undefined = isRecord(event.data)
          ? (event.data as SocialAuthMessage)
          : undefined;
        if (!data?.type) return;

        const allowedOrigins = [
          window.location.origin,
          ...(ENV.API_URL ? [ENV.API_URL.replace(/\/$/, "")] : []),
        ];
        const isAllowedOrigin =
          allowedOrigins.some((origin) => event.origin === origin) ||
          !ENV.API_URL;

        if (!isAllowedOrigin) {
          return;
        }

        if (data.type === "FACEBOOK_LOGIN_SUCCESS") {
          const msg = data as FacebookLoginSuccessMessage;
          const userData = msg.user ?? {};
          const token = msg.token || msg.tokens?.access_token;
          const tokens = token
            ? {
                access_token: token,
                token_type: "Bearer",
              }
            : msg.tokens;

          handleSuccess({ user: userData, tokens });
        } else if (data.type === "FACEBOOK_LOGIN_ERROR") {
          const msg = data as FacebookLoginErrorMessage;
          handleError(msg.error || msg.message || "Facebook login failed");
        } else if (data.type === "OAUTH_SUCCESS") {
          const msg = data as OAuthSuccessMessage;
          const userData = msg.user ?? {};
          const token = msg.token || msg.tokens?.access_token;
          const tokens: SocialTokens | undefined = token
            ? {
                access_token: token,
                token_type: "Bearer",
              }
            : msg.tokens;
          handleSuccess({ user: userData, tokens });
        } else if (data.type === "OAUTH_ERROR") {
          const msg = data as OAuthErrorMessage;
          handleError(msg.error || "OAuth authentication failed");
        }
      };

      window.addEventListener("message", messageListener);

      setTimeout(() => {
        if (!resolved) {
          cleanup();
          reject(new Error("Login timeout"));
        }
      }, 300000);
    });
  }, []);

  return {
    loginWithFacebook,
    isLoading,
    isSDKLoaded,
  };
};

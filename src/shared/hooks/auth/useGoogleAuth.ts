import { useState, useCallback } from "react";
import { ENV } from "src/config/environment";
import { AUTH_ROUTES } from "src/services/api/functions/auth/auth.routes";
import { GoogleUserResponse } from "src/shared/types/Reponse/auth/user";
import { logger } from "@/common/utils/logger";
import type {
  OAuthErrorMessage,
  OAuthSuccessMessage,
  GoogleLoginErrorMessage,
  GoogleLoginSuccessMessage,
  SocialAuthMessage,
  SocialAuthResult,
  SocialTokens,
} from "./socialPopup.types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useCallback((): Promise<GoogleUserResponse> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const baseApiUrl = (ENV.API_URL || "").replace(/\/$/, "");
      const authUrl = `${baseApiUrl}${AUTH_ROUTES.GOOGLE_LOGIN}`;

      if (!baseApiUrl) {
        setIsLoading(false);
        reject(new Error("Thiếu cấu hình VITE_API_BASE_URL cho social login"));
        return;
      }

      const popup = window.open(
        authUrl,
        "google-login",
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
        cleanup();
        resolve({
          ...(isRecord(result.user) ? result.user : {}),
          tokens: result.tokens,
        });
      };

      const handleError = (error: string) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(new Error(error));
      };

      const checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            if (!resolved) {
              cleanup();
              reject(new Error("Popup was closed by user"));
            }
            return;
          }
        } catch (error) {}
      }, 500);

      const messageListener = (event: MessageEvent) => {
        const data: SocialAuthMessage | undefined = isRecord(event.data)
          ? (event.data as SocialAuthMessage)
          : undefined;
        if (!data?.type) return;

        const isGoogleCallbackMessage =
          data.type === "GOOGLE_LOGIN_SUCCESS" ||
          data.type === "GOOGLE_LOGIN_ERROR";
        const allowedOrigins = [
          ENV.API_URL,
          window.location.origin,
          ...(ENV.API_URL ? [ENV.API_URL.replace(/\/$/, "")] : []),
        ];

        const isAllowedOrigin =
          allowedOrigins.some((origin) => event.origin === origin) ||
          isGoogleCallbackMessage || // Accept Google callback from any origin
          !ENV.API_URL; // If no API_URL configured, accept all

        if (!isAllowedOrigin && ENV.API_URL) {
          logger.warn("Rejected message from origin:", event.origin);
          return;
        }

        // Handle GOOGLE_LOGIN_SUCCESS from backend
        if (data.type === "GOOGLE_LOGIN_SUCCESS") {
          const msg = data as GoogleLoginSuccessMessage;
          // Backend returns: { type, token, user, message }
          const userData = msg.user ?? {};
          const token = msg.token;

          if (!token) {
            handleError("No token received from backend");
            return;
          }

          const tokens: SocialTokens = {
            access_token: token,
            token_type: "Bearer",
          };

          const normalizedUser = isRecord(userData)
            ? {
                ...userData,
                id:
                  typeof userData.userID === "number"
                    ? String(userData.userID)
                    : typeof userData.id === "string" ||
                        typeof userData.id === "number"
                      ? String(userData.id)
                      : "",
                name:
                  typeof userData.fullName === "string"
                    ? userData.fullName
                    : typeof userData.name === "string"
                      ? userData.name
                      : "",
                email: typeof userData.email === "string" ? userData.email : "",
                picture:
                  typeof userData.image === "string"
                    ? userData.image
                    : typeof userData.picture === "string"
                      ? userData.picture
                      : "",
                verified_email:
                  typeof userData.emailVerified === "boolean"
                    ? userData.emailVerified
                    : false,
              }
            : {};

          handleSuccess({ user: normalizedUser, tokens });
        } else if (data.type === "GOOGLE_LOGIN_ERROR") {
          const msg = data as GoogleLoginErrorMessage;
          handleError(msg.error || msg.message || "Google login failed");
        } else if (data.type === "OAUTH_SUCCESS") {
          const msg = data as OAuthSuccessMessage;
          // Generic OAuth success (fallback)
          const userData = msg.user ?? {};
          const token = msg.token || msg.tokens?.access_token;
          const tokens = token
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

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          reject(new Error("Login timeout"));
        }
      }, 300000);
    });
  }, []);

  return {
    loginWithGoogle,
    isLoading,
  };
};

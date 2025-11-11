import { useState, useCallback } from "react";
import { ENV } from "src/config/environment";
import { OAUTH_CONFIG } from "../../../config/oauth";
import { GoogleUserResponse } from "src/shared/types/Reponse/auth/user";

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useCallback((): Promise<GoogleUserResponse> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const authUrl =
        `${OAUTH_CONFIG.google.authUrl}?` +
        `client_id=${OAUTH_CONFIG.google.clientId}&` +
        `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.google.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.google.scope)}&` +
        `state=google_login&` +
        `access_type=offline&` +
        `prompt=consent`;

      const popup = window.open(
        authUrl,
        "google-login",
        "width=500,height=600,scrollbars=yes,resizable=yes,popup=yes"
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
          console.error("Error closing popup:", error);
        }
      };

      const handleSuccess = (userData: any, tokens?: any) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          ...userData,
          tokens,
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
        const isGoogleCallbackMessage =
          event.data?.type === "GOOGLE_LOGIN_SUCCESS" ||
          event.data?.type === "GOOGLE_LOGIN_ERROR";
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
          console.warn("Rejected message from origin:", event.origin);
          return;
        }

        // Handle GOOGLE_LOGIN_SUCCESS from backend
        if (event.data.type === "GOOGLE_LOGIN_SUCCESS") {
          // Backend returns: { type, token, user, message }
          const userData = event.data.user || {};
          const token = event.data.token;

          if (!token) {
            handleError("No token received from backend");
            return;
          }

          const tokens = {
            access_token: token,
            token_type: "Bearer",
          };

          // Pass both userData from backend and tokens
          handleSuccess(
            {
              ...userData,
              // Keep Google user fields for compatibility
              id: userData.userID?.toString() || userData.id || "",
              name: userData.fullName || userData.name || "",
              email: userData.email || "",
              picture: userData.image || userData.picture || "",
              verified_email: userData.emailVerified || false,
            },
            tokens
          );
        } else if (event.data.type === "GOOGLE_LOGIN_ERROR") {
          handleError(
            event.data.error || event.data.message || "Google login failed"
          );
        } else if (event.data.type === "OAUTH_SUCCESS") {
          // Generic OAuth success (fallback)
          const userData = event.data.user || {};
          const token = event.data.token || event.data.tokens?.access_token;
          const tokens = token
            ? {
                access_token: token,
                token_type: "Bearer",
              }
            : event.data.tokens;
          handleSuccess(userData, tokens);
        } else if (event.data.type === "OAUTH_ERROR") {
          handleError(event.data.error || "OAuth authentication failed");
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

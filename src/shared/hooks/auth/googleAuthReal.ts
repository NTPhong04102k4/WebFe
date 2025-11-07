// Real Google Authentication using OAuth 2.0
import { ENV } from "src/config/environment";
import { OAUTH_CONFIG } from "../../../config/oauth";

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  verified_email: boolean;
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
}

class GoogleAuthRealService {
  private static instance: GoogleAuthRealService;

  private constructor() {}

  public static getInstance(): GoogleAuthRealService {
    if (!GoogleAuthRealService.instance) {
      GoogleAuthRealService.instance = new GoogleAuthRealService();
    }
    return GoogleAuthRealService.instance;
  }

  public async loginWithGoogle(): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
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
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      let resolved = false;

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkInterval);
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

      // Check popup URL periodically to detect redirect
      const checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            if (!resolved) {
              cleanup();
              reject(new Error("Popup was closed by user"));
            }
            return;
          }

          // Try to access popup location (may throw if cross-origin)
          const popupUrl = popup.location.href;

          // Check if we're on the callback URL
          if (popupUrl.includes("/auth/callback/google")) {
            // Check for error in URL
            const urlParams = new URLSearchParams(popup.location.search);
            const hashParams = new URLSearchParams(
              popup.location.hash.substring(1)
            );

            const error = urlParams.get("error") || hashParams.get("error");
            if (error) {
              handleError(error || "Authentication failed");
              return;
            }

            // Check for success indicators
            const code = urlParams.get("code");
            const accessToken = hashParams.get("access_token");

            if (code || accessToken) {
              // Backend should handle this, but we'll wait for postMessage
              // If no message comes, we'll try to extract from URL
              setTimeout(() => {
                if (!resolved) {
                  // Fallback: assume success if we have code/token
                  handleSuccess({
                    id: "",
                    name: "",
                    email: "",
                    picture: "",
                    verified_email: false,
                  });
                }
              }, 1000);
            }
          }
        } catch (error) {
          // Cross-origin error is expected, ignore
        }
      }, 500);

      // Listen for postMessage from popup
      const messageListener = (event: MessageEvent) => {
        // Allow messages from API URL or same origin
        if (
          event.origin !== `${ENV.API_URL}` &&
          event.origin !== window.location.origin &&
          !event.origin.includes(ENV.API_URL || "")
        ) {
          return;
        }

        if (event.data.type === "GOOGLE_LOGIN_SUCCESS") {
          // Handle response with token and user
          const userData = event.data.user || {};
          const token = event.data.token || event.data.tokens?.access_token;
          const tokens = token
            ? {
                access_token: token,
                token_type: "Bearer",
              }
            : event.data.tokens;

          handleSuccess(userData, tokens);
        } else if (event.data.type === "GOOGLE_LOGIN_ERROR") {
          handleError(event.data.error || "Google login failed");
        } else if (event.data.type === "OAUTH_SUCCESS") {
          // Generic OAuth success
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
  }
}

export const googleAuthRealService = GoogleAuthRealService.getInstance();

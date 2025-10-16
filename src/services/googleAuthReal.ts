// Real Google Authentication using OAuth 2.0
import { OAUTH_CONFIG } from "../config/oauth";

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
      console.log("🔍 Starting real Google OAuth login...");
      console.log("📋 OAuth Config:", OAUTH_CONFIG.google);
      console.log(
        "🔗 Redirect URI being used:",
        OAUTH_CONFIG.google.redirectUri
      );

      // Create popup window for Google OAuth using authorization code flow
      // Redirect directly to Backend API (port 7250)
      const authUrl =
        `${OAUTH_CONFIG.google.authUrl}?` +
        `client_id=${OAUTH_CONFIG.google.clientId}&` +
        `redirect_uri=${encodeURIComponent(OAUTH_CONFIG.google.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(OAUTH_CONFIG.google.scope)}&` +
        `state=google_login&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log("🌐 Full Auth URL:", authUrl);

      const popup = window.open(
        authUrl,
        "google-login",
        "width=500,height=600,scrollbars=yes,resizable=yes,popup=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      // Listen for popup messages from Backend
      const messageListener = (event: MessageEvent) => {
        // Accept messages from Backend (localhost:7250) or same origin
        if (
          event.origin !== "https://localhost:7250" &&
          event.origin !== window.location.origin
        )
          return;

        if (event.data.type === "GOOGLE_LOGIN_SUCCESS") {
          console.log("🎉 Real Google Login Success!");
          console.log("📋 User Information:");
          console.log("ID: " + event.data.user.id);
          console.log("Name: " + event.data.user.name);
          console.log("Email: " + event.data.user.email);
          console.log("Image URL: " + event.data.user.picture);
          console.log("Email Verified: " + event.data.user.verified_email);
          console.log("🔑 Tokens received:", event.data.tokens);

          window.removeEventListener("message", messageListener);
          popupClosed = true;
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {
            // CORS error when trying to close popup - this is expected
          }

          // Return user data with tokens
          resolve({
            ...event.data.user,
            tokens: event.data.tokens,
          });
        } else if (event.data.type === "GOOGLE_LOGIN_ERROR") {
          console.error("❌ Google login error:", event.data.error);
          window.removeEventListener("message", messageListener);
          popupClosed = true;
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {
            // CORS error when trying to close popup - this is expected
          }
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener("message", messageListener);

      // Don't check popup.closed to avoid COOP errors
      // Instead, rely on timeout and message listener only
      let popupClosed = false;

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popupClosed) {
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {
            // CORS error when trying to close popup - this is expected
            // The popup will be closed by the user or browser
          }
          window.removeEventListener("message", messageListener);
          reject(new Error("Login timeout"));
        }
      }, 300000);
    });
  }
}

export const googleAuthRealService = GoogleAuthRealService.getInstance();

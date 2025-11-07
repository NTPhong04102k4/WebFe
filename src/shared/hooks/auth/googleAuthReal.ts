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

      const messageListener = (event: MessageEvent) => {
        if (
          event.origin !== `${ENV.API_URL}` &&
          event.origin !== window.location.origin
        )
          return;

        if (event.data.type === "GOOGLE_LOGIN_SUCCESS") {
          window.removeEventListener("message", messageListener);
          popupClosed = true;
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {}

          resolve({
            ...event.data.user,
            tokens: event.data.tokens,
          });
        } else if (event.data.type === "GOOGLE_LOGIN_ERROR") {
          window.removeEventListener("message", messageListener);
          popupClosed = true;
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {}
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener("message", messageListener);

      let popupClosed = false;

      setTimeout(() => {
        if (!popupClosed) {
          try {
            if (popup) {
              popup.close();
            }
          } catch (error) {}
          window.removeEventListener("message", messageListener);
          reject(new Error("Login timeout"));
        }
      }, 300000);
    });
  }
}

export const googleAuthRealService = GoogleAuthRealService.getInstance();

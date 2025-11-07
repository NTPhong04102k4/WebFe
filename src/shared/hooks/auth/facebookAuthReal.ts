// Real Facebook Authentication using Facebook SDK
import { ENV } from "src/config/environment";

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  birthday?: string;
  gender?: string;
  location?: {
    name: string;
  };
  hometown?: {
    name: string;
  };
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
}

class FacebookAuthRealService {
  private static instance: FacebookAuthRealService;
  private isSDKLoaded = false;

  private constructor() {
    this.initializeFacebookSDK();
  }

  public static getInstance(): FacebookAuthRealService {
    if (!FacebookAuthRealService.instance) {
      FacebookAuthRealService.instance = new FacebookAuthRealService();
    }
    return FacebookAuthRealService.instance;
  }

  private initializeFacebookSDK(): void {
    if (this.isSDKLoaded) return;

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log("✅ Facebook SDK loaded successfully");
      this.isSDKLoaded = true;
      this.initFacebookSDK();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Facebook SDK");
    };

    document.head.appendChild(script);
  }

  private initFacebookSDK(): void {
    if (typeof window !== "undefined" && (window as any).FB) {
      const FB = (window as any).FB;

      FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      console.log("✅ Facebook SDK initialized");
    }
  }

  public async loginWithFacebook(): Promise<FacebookUser> {
    return new Promise((resolve, reject) => {
      const popup = window.open(
        `https://www.facebook.com/v18.0/dialog/oauth?` +
          `client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&` +
          `redirect_uri=${encodeURIComponent(
            `${ENV.API_URL}/auth/callback/facebook`
          )}&` +
          `response_type=code&` +
          `scope=email,public_profile&` +
          `state=facebook_login`,
        "facebook-login",
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

        if (event.data.type === "FACEBOOK_LOGIN_SUCCESS") {
          console.log("🎉 Real Facebook Login Success!");
          console.log("📋 User Information:");
          console.log("ID: " + event.data.user.id);
          console.log("Name: " + event.data.user.name);
          console.log("Email: " + event.data.user.email);
          console.log(
            "Birthday: " + (event.data.user.birthday || "Not provided")
          );
          console.log("Gender: " + (event.data.user.gender || "Not provided"));
          console.log(
            "Location: " + (event.data.user.location?.name || "Not provided")
          );
          console.log(
            "Hometown: " + (event.data.user.hometown?.name || "Not provided")
          );
          console.log("Picture: " + event.data.user.picture);
          console.log("🔑 Tokens received:", event.data.tokens);

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
        } else if (event.data.type === "FACEBOOK_LOGIN_ERROR") {
          console.error("❌ Facebook login error:", event.data.error);
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

export const facebookAuthRealService = FacebookAuthRealService.getInstance();

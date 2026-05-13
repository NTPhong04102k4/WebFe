import { ENV } from "./environment";

// OAuth Configuration
export const OAUTH_CONFIG = {
  google: {
    clientId: ENV.GOOGLE_CLIENT_ID,
    redirectUri: `${ENV.API_URL}/signin-google`,
    scope: "openid email profile",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  facebook: {
    clientId: ENV.FACEBOOK_APP_ID,
    redirectUri: `${ENV.API_URL}/signin-facebook`,
    scope:
      "email,public_profile,user_birthday,user_gender,user_location,user_hometown",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
  },
};

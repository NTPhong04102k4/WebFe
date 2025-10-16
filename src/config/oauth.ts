// OAuth Configuration
export const OAUTH_CONFIG = {
  google: {
    clientId:
      process.env.REACT_APP_GOOGLE_CLIENT_ID ||
      "637322035022-dt9ilmsvs8t08kmhp6v027m5rea5gbc9.apps.googleusercontent.com",
    redirectUri: "https://localhost:7250/auth/callback/google", // Backend API endpoint
    scope: "openid email profile",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  facebook: {
    clientId: process.env.REACT_APP_FACEBOOK_APP_ID || "31580898284887499",
    redirectUri: "https://localhost:7250/auth/callback/facebook",
    scope:
      "email,public_profile,user_birthday,user_gender,user_location,user_hometown",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
  },
};

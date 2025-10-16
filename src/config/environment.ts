// Environment configuration
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || "https://localhost:7250",
  GOOGLE_CLIENT_ID:
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "637322035022-dt9ilmsvs8t08kmhp6v027m5rea5gbc9.apps.googleusercontent.com",
  FACEBOOK_APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID || "31580898284887499",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

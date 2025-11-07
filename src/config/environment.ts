// Environment configuration
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL,
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  FACEBOOK_APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID,
  NODE_ENV: process.env.NODE_ENV,
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  // SePay Configuration
  SEPAY_MERCHANT_ID: process.env.REACT_APP_SEPAY_MERCHANT_ID,
  SEPAY_SECRET_KEY: process.env.REACT_APP_SEPAY_SECRET_KEY,
  SEPAY_ENVIRONMENT: process.env.REACT_APP_SEPAY_ENVIRONMENT || "sandbox",
  SEPAY_BASE_URL:
    process.env.REACT_APP_SEPAY_BASE_URL || "https://pay-sandbox.sepay.vn",
};

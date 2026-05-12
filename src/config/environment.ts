const env = import.meta.env;

const MODE = env.MODE ?? "development";

export const ENV = {
  API_URL: env.VITE_API_BASE_URL as string | undefined,
  GOOGLE_CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID as string | undefined,
  FACEBOOK_APP_ID: env.VITE_FACEBOOK_APP_ID as string | undefined,
  NODE_ENV: MODE,
  IS_DEVELOPMENT: MODE === "development",
  IS_PRODUCTION: MODE === "production",
  SEPAY_MERCHANT_ID: env.VITE_SEPAY_MERCHANT_ID as string | undefined,
  SEPAY_SECRET_KEY: env.VITE_SEPAY_SECRET_KEY as string | undefined,
  SEPAY_ENVIRONMENT: (env.VITE_SEPAY_ENVIRONMENT as string) ?? "sandbox",
  SEPAY_BASE_URL:
    (env.VITE_SEPAY_BASE_URL as string) ?? "https://pay-sandbox.sepay.vn",
};

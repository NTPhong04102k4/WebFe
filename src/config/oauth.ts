import { ENV } from "./environment";

/**
 * Cấu hình OAuth — chỉ dùng làm reference/documentation.
 *
 * Flow thực tế: Frontend mở popup đến backend `/auth/login/google` hoặc
 * `/auth/login/facebook`. Backend xử lý toàn bộ Challenge → Callback → JWT,
 * rồi postMessage token về window.opener (frontend).
 *
 * Không dùng authUrl hay redirectUri này để tự build URL OAuth từ frontend.
 */
export const OAUTH_CONFIG = {
  google: {
    clientId: ENV.GOOGLE_CLIENT_ID,
    /**
     * Đây là URL BACKEND khởi động luồng OAuth (không phải Google callback).
     * Frontend popup sẽ mở URL này.
     */
    loginUrl: `${ENV.API_URL}/auth/login/google`,
    scope: "openid email profile",
  },
  facebook: {
    clientId: ENV.FACEBOOK_APP_ID,
    /**
     * Đây là URL BACKEND khởi động luồng OAuth.
     */
    loginUrl: `${ENV.API_URL}/auth/login/facebook`,
    scope: "email,public_profile",
  },
} as const;

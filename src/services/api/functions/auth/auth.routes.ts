import { API } from "../../endpoints";

/** @deprecated Prefer `API.auth` / `API.user` from `src/services/api/endpoints` */
export const AUTH_ROUTES = {
  LOGIN: API.auth.login,
  REGISTER: API.auth.register,
  VERIFY_OTP: API.auth.verifyOtp,
  RESEND_OTP: API.auth.resendOtp,
  UPDATE_PROFILE: API.user.updateProfile,
  ADMIN_LOGIN: API.auth.adminLogin,
  GOOGLE_LOGIN: API.auth.googleLogin,
  FACEBOOK_LOGIN: API.auth.facebookLogin,
  LOGOUT: API.auth.logout,
  FORGOT_PASSWORD: API.auth.forgotPassword,
  RESET_PASSWORD: API.auth.resetPassword,
} as const;

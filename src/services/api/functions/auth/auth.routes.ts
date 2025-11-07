export const AUTH_ROUTES = {
  // User Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",

  // Admin Authentication
  ADMIN_LOGIN: "/auth/admin/login",

  // OAuth
  GOOGLE_LOGIN: "/auth/login/google",
  FACEBOOK_LOGIN: "/auth/login/facebook",
} as const;

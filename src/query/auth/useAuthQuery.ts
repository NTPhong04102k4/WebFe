import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRolesFromToken, getTokenClaims } from "src/services/decode";
import { authAPI } from "src/services/api/functions/auth/authFn";
import {
  RegisterVerifyResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";

import { logger } from "@/common/utils/logger";
import { useAuthStore, type AuthUser } from "@/stores/authStore";

function mapProfileToAuthUser(profile: UserResponse, token: string): AuthUser {
  const roles = getRolesFromToken(token);
  return {
    id: profile.userID,
    userID: profile.userID,
    userUUID: profile.userUUID,
    userCode: profile.userCode,
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    address: profile.address,
    image: profile.image,
    role: roles[0] ?? "Customer",
  };
}

function mapVerifyOtpUser(
  user: RegisterVerifyResponse["data"]["user"],
  token: string
): AuthUser {
  const roles = getRolesFromToken(token);
  return {
    id: user.id,
    userID: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: roles[0] ?? "Customer",
  };
}

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const currentUser = useAuthStore((s) => s.user);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const logoutStore = useAuthStore((s) => s.logout);

  // ─── Login mutation ────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (response) => {
      // Backend trả TokenResponse: { accessToken, refreshToken, expiresIn, ... }
      // Một số version cũ có thể vẫn trả `token` — dùng cả hai
      const token = response.data.accessToken ?? response.data.token ?? "";
      const rToken = response.data.refreshToken ?? "";

      setTokens(token, rToken);
      clearUser();

      try {
        const claims = getTokenClaims(token);
        // Sub claim chứa userUUID (string) hoặc username
        const userUUID = claims?.sub ?? "";
        if (userUUID) {
          const profileResponse = await authAPI.getProfile(userUUID);
          if (profileResponse?.data) {
            setUser(mapProfileToAuthUser(profileResponse.data, token));
            queryClient.setQueryData(["profile"], profileResponse);
          }
        }
      } catch (error) {
        logger.error("Failed to fetch profile after login:", error);
      }
    },
  });

  // ─── Register mutation ─────────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {},
  });

  // ─── Admin login mutation ──────────────────────────────────────────────────
  const adminLoginMutation = useMutation({
    mutationFn: authAPI.adminLogin,
    onSuccess: (response) => {
      const token = response.data.token ?? "";
      const rToken = response.data.refreshToken ?? "";
      const claims = getTokenClaims(token);
      const roles = getRolesFromToken(token);

      setTokens(token, rToken);
      setUser({
        id: Number(claims?.sub ?? 0) || 0,
        userID: Number(claims?.sub ?? 0) || 0,
        userUUID: typeof claims?.sub === "string" ? claims.sub : undefined,
        username: String(claims?.unique_name ?? claims?.name ?? ""),
        email: String(claims?.email ?? ""),
        fullName:
          response.data.fullName ??
          String(claims?.name ?? claims?.unique_name ?? ""),
        role: roles[0] ?? "Admin",
      });
    },
  });

  // ─── Verify OTP mutation ───────────────────────────────────────────────────
  const verifyOtpMutation = useMutation({
    mutationFn: authAPI.verifyOtp,
    onSuccess: (response) => {
      const token = response.data.data.token ?? "";
      setTokens(token, "");
      setUser(mapVerifyOtpUser(response.data.data.user, token));
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // ─── Resend OTP mutation ───────────────────────────────────────────────────
  const resendOtpMutation = useMutation({
    mutationFn: authAPI.resendOtp,
  });

  // ─── Logout mutation ───────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(refreshToken ?? undefined),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
    onError: () => {
      // Dù API lỗi vẫn clear local state
      logoutStore();
      queryClient.clear();
    },
  });

  // ─── Profile query ─────────────────────────────────────────────────────────
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      authAPI.getProfile(String(currentUser?.userUUID ?? currentUser?.id ?? "")),
    enabled:
      !!accessToken && !!(currentUser?.userUUID ?? currentUser?.id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        logger.warn("⚠️ Profile query returned 401 - clearing credentials");
        logoutStore();
        return false;
      }
      if (error?.response?.status === 400) {
        logger.warn(
          "⚠️ Profile query returned 400 - skipping retry but keeping auth state:",
          error?.response?.data
        );
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    adminLogin: adminLoginMutation.mutate,
    adminLoginAsync: adminLoginMutation.mutateAsync,
    isAdminLoginLoading: adminLoginMutation.isPending,
    adminLoginError: adminLoginMutation.error,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    verifyOtp: verifyOtpMutation.mutate,
    verifyOtpAsync: verifyOtpMutation.mutateAsync,
    isVerifyOtpLoading: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    resendOtp: resendOtpMutation.mutate,
    resendOtpAsync: resendOtpMutation.mutateAsync,
    isResendOtpLoading: resendOtpMutation.isPending,
    resendOtpError: resendOtpMutation.error,

    logout: logoutMutation.mutate,
    isLogoutLoading: logoutMutation.isPending,

    profile: profileQuery.data?.data,
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    refetchProfile: profileQuery.refetch,

    isLoading:
      loginMutation.isPending ||
      adminLoginMutation.isPending ||
      registerMutation.isPending ||
      verifyOtpMutation.isPending ||
      resendOtpMutation.isPending ||
      logoutMutation.isPending,

    error:
      loginMutation.error ||
      adminLoginMutation.error ||
      registerMutation.error ||
      verifyOtpMutation.error ||
      resendOtpMutation.error ||
      profileQuery.error,
  };
};

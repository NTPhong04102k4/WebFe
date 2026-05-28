import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRolesFromToken } from "src/services/decode";
import { authAPI } from "src/services/api/functions/auth/authFn";
import { RegisterVerifyResponse, UserResponse } from "src/shared/types/Reponse/auth/user";

import { logger } from "@/common/utils/logger";
import { useAuthStore, type AuthUser } from "@/stores/authStore";
import { decodeToken } from "@/common/utils/jwtDecode";

// Query key factory — dùng username làm discriminator để tránh cache cross-user
export const profileQueryKey = (username: string) =>
  ["profile", username] as const;

function mapVerifyOtpUser(
  user: RegisterVerifyResponse["data"]["user"],
  token: string,
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
  const logoutStore = useAuthStore((s) => s.logout);

  // ─── Login mutation ────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const token = response.data.access_token ?? response.data.token ?? "";
      const rToken = response.data.refresh_token ?? "";
      setTokens(token, rToken);
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

      // decodeToken trả về AuthUser đầy đủ — không manual parse claim
      const decoded = decodeToken(token);
      const roles = getRolesFromToken(token);

      setTokens(token, rToken);
      setUser({
        id: decoded?.id ?? 0,
        userID: decoded?.userID ?? 0,
        userUUID: decoded?.userUUID,
        userCode: decoded?.userCode,
        username: decoded?.username ?? "",
        email: decoded?.email ?? "",
        // fullName từ response body ưu tiên hơn JWT vì backend trả đúng tên
        fullName: response.data.fullName || decoded?.fullName || "",
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
      // Dù API lỗi vẫn clear local state để user không bị kẹt
      logoutStore();
      queryClient.clear();
    },
  });

  // ─── Profile query ─────────────────────────────────────────────────────────
  // Chỉ fetch khi user là Customer — Admin/Staff không có endpoint /user/{username}
  const profileUsername = currentUser?.username ?? currentUser?.email ?? "";

  const profileQuery = useQuery({
    queryKey: profileQueryKey(profileUsername),
    queryFn: () => authAPI.getProfile(profileUsername),
    enabled:
      !!accessToken &&
      !!profileUsername &&
      currentUser?.role === "Customer",
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 400) {
        logger.warn(
          `Profile query returned ${status} - skipping retry, keeping auth state`,
        );
        return false;
      }
      return failureCount < 1;
    },
    select: (res) => {
      const payload = res.data as any;
      return (payload && typeof payload === "object" && "data" in payload
        ? payload.data
        : payload) as UserResponse;
    },
  });

  // Merge profile API data vào Zustand — chỉ overwrite field user có thể cập nhật
  // Giữ nguyên: role, userUUID, userCode (source of truth là JWT)
  useEffect(() => {
    if (profileQuery.data && currentUser) {
      setUser({
        ...currentUser,
        fullName: profileQuery.data.fullName || currentUser.fullName,
        phone: profileQuery.data.phone ?? currentUser.phone,
        address: profileQuery.data.address ?? currentUser.address,
        image: profileQuery.data.image ?? currentUser.image,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data]);

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

    profile: profileQuery.data,
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

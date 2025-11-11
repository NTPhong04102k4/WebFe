import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "src/redux/hook";
import {
  clearCredentials,
  selectAuth,
  setCredentials,
} from "src/redux/Slice/AuthSlice";
import { authAPI } from "src/services/api/functions/auth/authFn";
import { getTokenClaims } from "src/services/decode";
import { RegisterVerifyResponse } from "src/shared/types/Reponse/auth/user";

export const useAuthQuery = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const authState = useAppSelector(selectAuth);
  const userName = getTokenClaims(authState.token);
  console.log("🔍 userName:", userName);

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (response) => {
      dispatch(
        setCredentials({
          token: response.data.token ?? null,
          user: null,
          isAuthenticated: response.data.token ? true : false,
        })
      );
      try {
        const profileResponse = await authAPI.getProfile(userName?.sub ?? "");
        if (profileResponse?.data) {
          dispatch(
            setCredentials({
              token: response.data.token ?? null,
              user: profileResponse.data,
              isAuthenticated: response.data.token ? true : false,
            })
          );
          queryClient.setQueryData(["profile"], profileResponse);
        }
      } catch (error) {
        console.error("Failed to fetch profile after login:", error);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {},
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authAPI.verifyOtp,
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          token: response.data.data.token ?? null,
          user: response.data.data
            .user as RegisterVerifyResponse["data"]["user"],
          isAuthenticated: response.data.data.token ? true : false,
        })
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: authAPI.resendOtp,
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      window.location.href = "/auth/login";
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => authAPI.getProfile(authState.user?.userUUID ?? ""),
    enabled: authState.isAuthenticated && !!authState.user?.userUUID,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        console.warn("⚠️ Profile query returned 401 - clearing credentials");
        dispatch(clearCredentials());
        return false;
      }
      if (error?.response?.status === 400) {
        console.warn(
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
      registerMutation.isPending ||
      verifyOtpMutation.isPending ||
      resendOtpMutation.isPending ||
      logoutMutation.isPending,
    error:
      loginMutation.error ||
      registerMutation.error ||
      verifyOtpMutation.error ||
      resendOtpMutation.error ||
      profileQuery.error,
  };
};

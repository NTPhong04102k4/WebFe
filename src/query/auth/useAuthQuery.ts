import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "src/redux/hook";
import { clearCredentials, setCredentials } from "src/redux/Slice/AuthSlice";
import { authAPI } from "src/services/api/functions/auth/authFn";
import { RegisterVerifyResponse } from "src/shared/types/Reponse/auth/user/input";

export const useAuthQuery = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (response) => {
      const token = response.data.token;

      dispatch(
        setCredentials({
          token: token,
          user: null,
        })
      );
      try {
        const profileResponse = await authAPI.getProfile();
        if (profileResponse?.data) {
          dispatch(
            setCredentials({
              token: token,
              user: profileResponse.data,
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
          token: response.data.data.token,
          user: response.data.data
            .user as RegisterVerifyResponse["data"]["user"],
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
    queryFn: () => authAPI.getProfile(),
    enabled: !!localStorage.getItem("auth_token"),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        dispatch(clearCredentials());
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

    // Register
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    // Verify OTP
    verifyOtp: verifyOtpMutation.mutate,
    verifyOtpAsync: verifyOtpMutation.mutateAsync,
    isVerifyOtpLoading: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    // Resend OTP
    resendOtp: resendOtpMutation.mutate,
    resendOtpAsync: resendOtpMutation.mutateAsync,
    isResendOtpLoading: resendOtpMutation.isPending,
    resendOtpError: resendOtpMutation.error,

    // Logout
    logout: logoutMutation.mutate,
    isLogoutLoading: logoutMutation.isPending,

    // Profile
    profile: profileQuery.data?.data,
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    refetchProfile: profileQuery.refetch,

    // Combined states
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

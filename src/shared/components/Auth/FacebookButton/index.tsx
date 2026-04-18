import React from "react";
import { logger } from "src/utils/logger";
import { setCredentials } from "src/redux/Slice/AuthSlice";
import { useAppDispatch } from "src/redux/hook";
import { useFacebookAuth } from "src/shared/hooks/auth/useFacebookAuth";
import { useSocialAuthMapper } from "src/shared/hooks/auth/useSocialAuthMapper";
import { UserResponse } from "src/shared/types/Reponse/auth/user";

interface FacebookLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onSuccess,
  onError,
  className = "",
  children,
}) => {
  const dispatch = useAppDispatch();
  const { loginWithFacebook, isLoading: isLoggingIn } = useFacebookAuth();
  const { mapFacebookUser } = useSocialAuthMapper();

  const handleFacebookLogin = async () => {
    logger.log("🖱️ Facebook button clicked!");
    try {
      logger.log("🔄 Calling loginWithFacebook...");

      // Lấy thông tin user từ Facebook OAuth
      const response = await loginWithFacebook();
      logger.log("✅ Facebook user received:", response);

      const token = response.tokens?.access_token || "";
      if (!token) {
        throw new Error("Không nhận được token từ Facebook");
      }

      // Check if user data is already in UserResponse format (from backend)
      const isBackendUserData =
        (response as any).userID !== undefined ||
        (response as any).userUUID !== undefined;

      let userData: any;
      if (isBackendUserData) {
        // Use backend user data directly (already in correct format)
        userData = response as unknown as UserResponse;
        logger.log("Using backend user data directly");
      } else {
        // Map social auth response to UserResponse format
        userData = mapFacebookUser(response);
        logger.log("Mapped social auth response");
      }

      dispatch(
        setCredentials({
          token: token,
          user: userData,
          isAuthenticated: true,
        })
      );

      logger.log("✅ loginWithFacebook completed, calling onSuccess");
      onSuccess?.();
    } catch (error) {
      logger.error("❌ Facebook login error:", error);
      onError?.(error as Error);
    } finally {
      logger.log("🏁 Facebook login handler finished");
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoggingIn}
      className={`
        flex items-center justify-center gap-3 px-6 py-3 
        bg-[#1877F2] hover:bg-[#166FE5] 
        text-white font-medium rounded-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoggingIn ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang đăng nhập...</span>
        </div>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {children || "Đăng nhập với Facebook"}
        </>
      )}
    </button>
  );
};

export default FacebookLoginButton;

import React from "react";
import { Chrome, Facebook } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleSuccess: () => void;
  onGoogleError: () => void;
  onFacebookSuccess: () => void;
  onFacebookError: () => void;
  isLogin: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleSuccess,
  onGoogleError,
  onFacebookSuccess,
  onFacebookError,
  isLogin,
}) => {
  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Hoặc {isLogin ? "đăng nhập" : "đăng ký"} bằng
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {/* Google Login Button */}
        <button
          onClick={onGoogleSuccess}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Chrome className="h-5 w-5 mr-3 text-red-500" />
          <span className="font-medium">
            {isLogin ? "Đăng nhập" : "Đăng ký"} với Google
          </span>
        </button>

        {/* Facebook Login Button */}
        <button
          onClick={onFacebookSuccess}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Facebook className="h-5 w-5 mr-3 text-blue-600" />
          <span className="font-medium">
            {isLogin ? "Đăng nhập" : "Đăng ký"} với Facebook
          </span>
        </button>
      </div>
    </div>
  );
};

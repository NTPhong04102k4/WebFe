import React from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
  };
  onInputChange: (field: string, value: string) => void;
  onLogin: () => void;
  isLoading: boolean;
  isHide: boolean;
  onToggleHide: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  onInputChange,
  onLogin,
  isLoading,
  isHide,
  onToggleHide,
}) => {
  return (
    <div className="space-y-6">
      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          disabled={isLoading}
        />
      </div>

      {/* Password Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={isHide ? "password" : "text"}
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={(e) => onInputChange("password", e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onToggleHide}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          disabled={isLoading}
        >
          {isHide ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
        >
          Quên mật khẩu?
        </a>
      </div>

      {/* Login Button */}
      <button
        onClick={onLogin}
        disabled={isLoading || !formData.email || !formData.password}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang đăng nhập...
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </div>
  );
};

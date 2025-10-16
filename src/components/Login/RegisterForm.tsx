import React from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface RegisterFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
  };
  onInputChange: (field: string, value: string) => void;
  onRegister: () => void;
  isLoading: boolean;
  isHide: boolean;
  onToggleHide: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  onInputChange,
  onRegister,
  isLoading,
  isHide,
  onToggleHide,
}) => {
  return (
    <div className="space-y-6">
      {/* Name Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Họ và tên"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          disabled={isLoading}
        />
      </div>

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

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <span className="ml-2 text-sm text-gray-600">
          Tôi đồng ý với{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Chính sách bảo mật
          </a>
        </span>
      </div>

      {/* Register Button */}
      <button
        onClick={onRegister}
        disabled={
          isLoading || !formData.name || !formData.email || !formData.password
        }
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
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
            Đang đăng ký...
          </>
        ) : (
          "Đăng ký"
        )}
      </button>
    </div>
  );
};

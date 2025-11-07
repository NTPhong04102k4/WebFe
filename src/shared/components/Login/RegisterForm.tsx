import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import {
  registerSchema,
  RegisterFormData,
} from "src/shared/validation/authSchemas";

interface RegisterFormProps {
  onRegister: (data: RegisterFormData) => void;
  isLoading: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  isLoading,
}) => {
  const [isHide, setIsHide] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = (data: RegisterFormData) => {
    if (!acceptedTerms) return;
    onRegister(data);
  };

  const hasErrors = !!errors.name || !!errors.email || !!errors.password;
  const isButtonDisabled = isLoading || hasErrors || !acceptedTerms;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Input */}
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Username"
            {...register("name")}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email Input */}
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={isHide ? "password" : "text"}
            placeholder="Mật khẩu"
            {...register("password")}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setIsHide(!isHide)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
            disabled={isLoading}
          >
            {isHide ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 cursor-pointer"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-gray-600">
            Tôi đồng ý với{" "}
            <a
              href="https://sites.google.com/view/privacy-policy-ntphong"
              className="text-blue-600 hover:text-blue-500"
            >
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="https://sites.google.com/view/privacy-policy-ntphong"
              className="text-blue-600 hover:text-blue-500"
            >
              Chính sách bảo mật
            </a>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isButtonDisabled}
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
    </form>
  );
};

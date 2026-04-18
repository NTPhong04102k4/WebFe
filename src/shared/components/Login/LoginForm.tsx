import React, { useState, useEffect } from "react";
import { storage } from "src/services/storage";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginSchema, LoginFormData } from "src/shared/validation/authSchemas";

const REMEMBER_ME_KEY = "remembered_email";

interface LoginFormProps {
  onLogin: (data: LoginFormData) => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
  const [isHide, setIsHide] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const emailValue = watch("email");

  // Load remembered email when component mounts
  useEffect(() => {
    const rememberedEmail = storage.get(REMEMBER_ME_KEY);
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  // Save or remove email from localStorage based on rememberMe checkbox
  useEffect(() => {
    if (rememberMe && emailValue) {
      storage.set(REMEMBER_ME_KEY,emailValue);
    } else if (!rememberMe) {
      storage.remove(REMEMBER_ME_KEY);
    }
  }, [rememberMe, emailValue]);

  const onSubmit = (data: LoginFormData) => {
    if (rememberMe) {
      storage.set(REMEMBER_ME_KEY,data.email);
    } else {
      storage.remove(REMEMBER_ME_KEY);
    }
    onLogin(data);
  };

  const hasErrors = !!errors.email || !!errors.password;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Email hoặc số điện thoại"
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            disabled={isLoading}
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
        type="submit"
        disabled={isLoading || hasErrors}
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
    </form>
  );
};

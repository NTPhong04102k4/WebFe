import React, { useState, useRef, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";

interface OtpVerificationFormProps {
  email: string;
  onVerifyOtp: (otp: string) => void;
  onResendOtp: () => void;
  onBack: () => void;
  isLoading: boolean;
  isResending: boolean;
  error?: string;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  email,
  onVerifyOtp,
  onResendOtp,
  onBack,
  isLoading,
  isResending,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOnChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && !isLoading) {
      onVerifyOtp(newOtp.join(""));
    }
  };

  const handleOnKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus on the next empty field or the last field
    const nextIndex = Math.min(pastedData.length, 5);
    setActiveOtpIndex(nextIndex);
    inputRefs.current[nextIndex]?.focus();

    // Auto submit if all fields are filled
    if (newOtp.every((digit) => digit !== "") && !isLoading) {
      onVerifyOtp(newOtp.join(""));
    }
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(600); // Reset timer
      onResendOtp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Xác thực Email
        </h2>
        <p className="text-gray-600">
          Chúng tôi đã gửi mã xác thực 6 chữ số đến
        </p>
        <p className="text-blue-600 font-medium">{email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOnChange(index, e.target.value)}
            onKeyDown={(e) => handleOnKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
              activeOtpIndex === index
                ? "border-blue-500"
                : digit
                ? "border-green-500 bg-green-50"
                : "border-gray-300"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Timer and Resend */}
      <div className="text-center">
        {timeLeft > 0 ? (
          <p className="text-gray-600 text-sm">
            Mã OTP sẽ hết hạn sau:{" "}
            <span className="font-medium text-red-600">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-500 font-medium text-sm transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi lại...
              </>
            ) : (
              "Gửi lại mã OTP"
            )}
          </button>
        )}
      </div>

      {/* Manual Submit Button */}
      <button
        onClick={() => onVerifyOtp(otp.join(""))}
        disabled={
          isLoading ||
          otp.some((digit) => digit === "") ||
          otp.join("").length !== 6
        }
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
            Đang xác thực...
          </>
        ) : (
          "Xác thực"
        )}
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại đăng ký
      </button>
    </div>
  );
};

import * as yup from "yup";

const strictUsernameRegex = /^[A-Za-z0-9]{8,}$/;

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Vui lòng nhập email, số điện thoại hoặc tên người dùng")
    .min(3, "Email, số điện thoại hoặc tên người dùng phải có ít nhất 3 ký tự")
    .test(
      "is-valid-input",
      "Vui lòng nhập email, số điện thoại hoặc tên người dùng hợp lệ",
      (value) => {
        if (!value) return false;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^(\+84|0)[1-9][0-9]{8,9}$/;
        const usernamePattern = /^[a-zA-Z0-9._-]+$/;

        return (
          emailPattern.test(value) ||
          phonePattern.test(value.replace(/\s/g, "")) ||
          usernamePattern.test(value)
        );
      }
    ),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
});

// Register validation schema
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Vui lòng nhập tên đăng nhập")
    .matches(
      strictUsernameRegex,
      "Tên đăng nhập phải có ít nhất 8 ký tự và chỉ gồm chữ cái, chữ số"
    ),
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt"
    ),
});

// OTP validation schema
export const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("Vui lòng nhập mã OTP")
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .matches(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

// Type definitions
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type OtpFormData = yup.InferType<typeof otpSchema>;

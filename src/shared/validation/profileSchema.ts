import * as yup from "yup";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  username: string;
  identityNumber: string;
  phone: string;
  dateOfBirth: string;
  image?: File | string | null;
}

const vietnameseNameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]+$/;
const usernameRegex = /^[A-Za-z0-9]{8,}$/;
const vietnamPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const identityRegex = /^(\d{9}|\d{12})$/;

export const profileSchema: yup.ObjectSchema<ProfileFormValues> = yup
  .object({
    firstName: yup
      .string()
      .trim()
      .required("Vui lòng nhập tên")
      .matches(
        vietnameseNameRegex,
        "Tên chỉ được chứa chữ cái và khoảng trắng"
      ),
    lastName: yup
      .string()
      .trim()
      .required("Vui lòng nhập họ")
      .matches(vietnameseNameRegex, "Họ chỉ được chứa chữ cái và khoảng trắng"),
    username: yup
      .string()
      .trim()
      .required("Vui lòng nhập tên đăng nhập")
      .matches(
        usernameRegex,
        "Tên đăng nhập phải có ít nhất 8 ký tự và chỉ bao gồm chữ và số"
      ),
    identityNumber: yup
      .string()
      .trim()
      .required("Vui lòng nhập mã định danh cá nhân")
      .matches(identityRegex, "Mã định danh phải gồm 9 hoặc 12 chữ số"),
    phone: yup
      .string()
      .trim()
      .required("Vui lòng nhập số điện thoại")
      .matches(vietnamPhoneRegex, "Số điện thoại phải theo định dạng Việt Nam"),
    dateOfBirth: yup
      .string()
      .required("Vui lòng chọn ngày sinh")
      .test("is-valid-date", "Ngày sinh không hợp lệ", (value) => {
        if (!value) return false;
        const parsed = new Date(value);
        return !Number.isNaN(parsed.getTime());
      })
      .test("is-not-future", "Ngày sinh không được ở tương lai", (value) => {
        if (!value) return false;
        return new Date(value) <= new Date();
      })
      .test("is-at-least-18", "Bạn phải đủ 18 tuổi", (value) => {
        if (!value) return false;
        const dob = new Date(value);
        const today = new Date();
        const eighteenYearsAgo = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        return dob <= eighteenYearsAgo;
      }),
    image: yup.mixed<File | string>().nullable().optional(),
  })
  .required();

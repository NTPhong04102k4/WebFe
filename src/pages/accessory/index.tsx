import React, { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Header } from "src/shared/components/header";
import { useNavigate } from "react-router";

// Define interfaces for form data
interface IFormInputs {
  fullName: string;
  phone: string;
  email: string;
  carName: string;
  carPhoto: FileList | null;
}

// Define validation schema
const schema: yup.ObjectSchema<IFormInputs> = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  carName: yup.string().required("Car Name is required"),
  carPhoto: yup
    .mixed<FileList>()
    .required("A car photo is required")
    .test("fileSize", "File size is too large", (value) => {
      return value && value[0]?.size <= 10 * 1024 * 1024; // Max size 10MB
    }),
});

const Accessory: React.FC = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setValue("carPhoto", e.target.files);
    }
  };

  const onSubmit = (data: IFormInputs): void => {
    setShowDialog(true);
  };

  const handleConfirm = (): void => {
    setShowDialog(false);
    alert("Bạn đã gửi yêu cầu bảo dưỡng xe thành công!");
    navigate("/home");
  };

  const handleCancel = (): void => {
    setShowDialog(false);
  };

  // Helper function for input class names
  const getInputClassName = (error: boolean): string => {
    return `w-full border ${
      error ? "border-red-500" : "border-gray-300"
    } rounded-lg px-3 py-2 mt-1`;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full relative">
      <Header />
      <main
        className={`container mx-auto px-[10%] py-8 relative z-10 transition-all duration-300 ${
          showDialog ? "blur-sm opacity-50" : "opacity-100"
        }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-base text-gray-600 mb-8">
          <span>Home</span>
          <span>/</span>
          <span>Accessories</span>
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Accessories Registration
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Please fill in your information below
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className={getInputClassName(!!errors.fullName)}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className={getInputClassName(!!errors.phone)}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={getInputClassName(!!errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Car Name */}
            <div>
              <label htmlFor="carName" className="block text-gray-700">
                Car Name
              </label>
              <input
                id="carName"
                type="text"
                placeholder="Enter your car name"
                className={getInputClassName(!!errors.carName)}
                {...register("carName")}
              />
              {errors.carName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.carName.message}
                </p>
              )}
            </div>

            {/* Car Photo */}
            <div>
              <label htmlFor="carPhoto" className="block text-gray-700">
                Car Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex flex-col items-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected car"
                      className="w-full max-w-sm h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="h-12 w-12 text-gray-400 mb-4">📷</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="carPhoto"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => document.getElementById("carPhoto")?.click()}
                  >
                    Choose Photo
                  </button>
                  {errors.carPhoto && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.carPhoto.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-300"
            >
              Submit Registration
            </button>
          </form>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="mb-4">
              Bạn xác nhận gửi yêu cầu bảo dưỡng xe cho chúng tôi?
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Xác nhận
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accessory;

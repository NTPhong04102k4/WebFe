import React from "react";
import { ENV } from "src/config/environment";
import { logger } from "@/common/utils/logger";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { useLocationList } from "src/query/location/useLocationQueries";
import { useCarMutations } from "src/query/car/useCarQueries";
import { CarDetailUpdateRequest } from "src/shared/types/Request/Car";
import { useAuth } from "src/shared/hooks/auth";

type Condition = "New" | "Used" | "Certified";

export const CreateCarForm: React.FC<{
  onCreated?: () => void;
}> = ({ onCreated }) => {
  const { data: brandCar = [], isLoading: brandsLoading } = useBrandCarList();
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList();
  const { data: locations = [], isLoading: locationsLoading } = useLocationList();
  const { createCar } = useCarMutations();
  const { user } = useAuth();
  const [form, setForm] = React.useState({
    carCode: "",
    vin: "",
    carName: "",
    modelYear: "",
    modelName: "",
    brandID: "",
    bodyTypeID: "",
    statusID: "",
    condition: "New" as Condition,
    locationID: "",
    price: "",
    importPrice: "",
    salePrice: "",
    engineSize: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "FWD",
    doors: "4",
    seats: "",
    color: "Đen",
    mileage: "",
    imagePaths: "",
    detailedDescription: "",
    shortDescription: "",
    isFeature: false,
  });
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = React.useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages((prev) => [...prev, ...fileArray]);

      // Create previews
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove video
  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  // Helper to convert bodyCode to bodyTypeID (using index + 1 as fallback)
  const getBodyTypeID = (bodyCode: string | number): number => {
    if (typeof bodyCode === "number") return bodyCode;
    const index = bodyTypes.findIndex((t) => t.bodyCode === bodyCode);
    return index >= 0 ? index + 1 : Number(bodyCode) || 1;
  };

  // Helper to convert locationCode to locationID (using index + 1 as fallback)
  const getLocationID = (locationCode: string | number): number => {
    if (typeof locationCode === "number") return locationCode;
    const index = locations.findIndex(
      (loc) => loc.locationCode === locationCode
    );
    return index >= 0 ? index + 1 : Number(locationCode) || 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imagePathsArray = form.imagePaths
      ? form.imagePaths
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      : [];

    const createData: CarDetailUpdateRequest = {
      userUUID: user?.userUUID || "",
      roles: "",
      carCode: form.carCode || "",
      vin: form.vin || "",
      carName: form.carName,
      brandID: Number(form.brandID),
      modelName: form.modelName,
      modelYear: Number(form.modelYear),
      bodyTypeID: getBodyTypeID(form.bodyTypeID),
      statusID: Number(form.statusID),
      condition: form.condition,
      locationID: getLocationID(form.locationID),
      price: Number(form.price),
      importPrice: form.importPrice ? Number(form.importPrice) : 0,
      salePrice: Number(form.salePrice),
      engineSize: Number(form.engineSize),
      fuelType: form.fuelType,
      transmission: form.transmission,
      driveType: form.driveType,
      doors: Number(form.doors),
      seats: Number(form.seats),
      color: form.color,
      mileage: Number(form.mileage),
      videoPath: null,
      imagePaths: imagePathsArray,
      detailedDescription: form.detailedDescription || null,
      shortDescription: form.shortDescription,
      isFeature: form.isFeature,
      viewCount: 0,
      soldDate: "",
      createdBy: 1,
      isActive: true,
    };

    const formData = new FormData();

    formData.append("userUUID", createData.userUUID || "");
    formData.append("roles", createData.roles || "");
    formData.append("CarCode", createData.carCode || "");
    formData.append("VIN", createData.vin || "");
    formData.append("CarName", createData.carName || "");
    formData.append("BrandID", String(createData.brandID || 0));
    formData.append("ModelName", createData.modelName || "");
    formData.append("ModelYear", String(createData.modelYear || 0));
    formData.append("BodyTypeID", String(createData.bodyTypeID || 0));
    formData.append("StatusID", String(createData.statusID || 0));
    formData.append("Condition", createData.condition || "");
    formData.append("LocationID", String(createData.locationID || 0));
    formData.append("Price", String(createData.price || 0));
    formData.append("ImportPrice", String(createData.importPrice || 0));
    formData.append("SalePrice", String(createData.salePrice || 0));
    formData.append("EngineSize", String(createData.engineSize || 0));
    formData.append("FuelType", createData.fuelType || "");
    formData.append("Transmission", createData.transmission || "");
    formData.append("DriveType", createData.driveType || "");
    formData.append("Doors", String(createData.doors || 0));
    formData.append("Seats", String(createData.seats || 0));
    formData.append("Color", createData.color || "");
    formData.append("Mileage", String(createData.mileage || 0));
    formData.append(
      "DetailedDescription",
      createData.detailedDescription || ""
    );
    formData.append("ShortDescription", createData.shortDescription || "");
    formData.append("IsFeature", String(createData.isFeature || false));
    formData.append("ViewCount", String(createData.viewCount || 0));
    formData.append("SoldDate", createData.soldDate || "");
    formData.append("CreatedBy", String(createData.createdBy || 0));
    formData.append("IsActive", String(createData.isActive || false));

    selectedImages.forEach((image) => {
      formData.append("ImageFiles", image);
    });

    if (selectedVideo) {
      formData.append("VideoFile", selectedVideo);
    }

    createCar.mutate(
      { data: formData as any },
      {
        onSuccess: () => {
          onCreated?.();
          setForm({
            carCode: "",
            vin: "",
            carName: "",
            modelYear: "",
            modelName: "",
            brandID: "",
            bodyTypeID: "",
            statusID: "",
            condition: "New",
            locationID: "",
            price: "",
            importPrice: "",
            salePrice: "",
            engineSize: "",
            fuelType: "Petrol",
            transmission: "Automatic",
            driveType: "FWD",
            doors: "4",
            seats: "",
            color: "Đen",
            mileage: "",
            imagePaths: "",
            detailedDescription: "",
            shortDescription: "",
            isFeature: false,
          });
          setSelectedImages([]);
          setSelectedVideo(null);
          setImagePreviews([]);
          setVideoPreview(null);
        },
        onError: (error: any) => {
          console.error("Error creating car:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            request: error.config,
          });

          alert(`Lỗi: ${error.message}`);
        },
      }
    );
  };

  const canSubmit = React.useMemo(() => {
    const checks = {
      carName: form.carName.trim() !== "",
      modelYear: form.modelYear.trim() !== "",
      modelName: form.modelName.trim() !== "",
      brandID: form.brandID.trim() !== "",
      bodyTypeID: form.bodyTypeID.trim() !== "",
      statusID: form.statusID.trim() !== "",
      condition: !!form.condition,
      locationID: form.locationID.trim() !== "",
      price: form.price.trim() !== "",
      salePrice: form.salePrice.trim() !== "",
      engineSize: form.engineSize.trim() !== "",
      fuelType: !!form.fuelType,
      transmission: !!form.transmission,
      driveType: !!form.driveType,
      doors: !!form.doors,
      seats: form.seats.trim() !== "",
      color: form.color.trim() !== "",
      mileage: form.mileage.trim() !== "",
      shortDescription: form.shortDescription.trim() !== "",
    };
    logger.log("checks", form.brandID);
    const allValid = Object.values(checks).every((v) => v === true);

    // Debug: log which fields are invalid
    if (!allValid && ENV.IS_DEVELOPMENT) {
      const invalidFields = Object.entries(checks)
        .filter(([_, valid]) => !valid)
        .map(([field]) => field);
      logger.log("❌ Invalid fields:", invalidFields);
    }

    return allValid;
  }, [form]);

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-base font-semibold mb-4">Tạo mới xe</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Car Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã xe</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.carCode}
              onChange={(e) =>
                setForm((s) => ({ ...s, carCode: e.target.value }))
              }
              placeholder="VD: CAMRY25Q"
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium mb-1">VIN</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.vin}
              onChange={(e) => setForm((s) => ({ ...s, vin: e.target.value }))}
              placeholder="VD: VIN000000000000001"
            />
          </div>

          {/* Car Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên xe</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.carName}
              onChange={(e) =>
                setForm((s) => ({ ...s, carName: e.target.value }))
              }
              placeholder="VD: Toyota Camry 2.5Q 2024"
              required
            />
          </div>

          {/* Model Year */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Năm sản xuất
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.modelYear}
              onChange={(e) =>
                setForm((s) => ({ ...s, modelYear: e.target.value }))
              }
              placeholder="VD: 2024"
              required
            />
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên model</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.modelName}
              onChange={(e) =>
                setForm((s) => ({ ...s, modelName: e.target.value }))
              }
              placeholder="VD: Camry"
              required
            />
          </div>

          {/* Brand ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Hãng xe</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.brandID}
              onChange={(e) =>
                setForm((s) => ({ ...s, brandID: e.target.value }))
              }
              disabled={brandsLoading}
              required
            >
              <option value="">Chọn hãng</option>
              {brandCar.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Dòng xe</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.bodyTypeID}
              onChange={(e) =>
                setForm((s) => ({ ...s, bodyTypeID: e.target.value }))
              }
              disabled={bodiesLoading}
              required
            >
              <option value="">Chọn dòng xe</option>
              {bodyTypes.map((t) => (
                <option key={t.bodyCode} value={t.bodyCode}>
                  {t.bodyName}
                </option>
              ))}
            </select>
          </div>

          {/* Status ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.statusID}
              onChange={(e) =>
                setForm((s) => ({ ...s, statusID: e.target.value }))
              }
              placeholder="VD: 1"
              required
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium mb-1">Tình trạng</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.condition}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  condition: e.target.value as Condition,
                }))
              }
              required
            >
              <option value="New">Xe mới</option>
              <option value="Used">Xe cũ</option>
              <option value="Certified">Xe cũ đã chứng nhận</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.locationID}
              onChange={(e) =>
                setForm((s) => ({ ...s, locationID: e.target.value }))
              }
              disabled={locationsLoading}
              required
            >
              <option value="">Chọn địa điểm</option>
              {locations.map((loc) => (
                <option key={loc.locationCode} value={loc.locationCode}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VND)</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.price}
              onChange={(e) =>
                setForm((s) => ({ ...s, price: e.target.value }))
              }
              placeholder="VD: 1450000000"
              required
            />
          </div>

          {/* Import Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá nhập (VND)
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.importPrice}
              onChange={(e) =>
                setForm((s) => ({ ...s, importPrice: e.target.value }))
              }
              placeholder="VD: 1400000000"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá bán (VND)
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.salePrice}
              onChange={(e) =>
                setForm((s) => ({ ...s, salePrice: e.target.value }))
              }
              placeholder="VD: 1445000000"
              required
            />
          </div>

          {/* Engine Size */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Dung tích động cơ (L)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded-md px-3 py-2"
              value={form.engineSize}
              onChange={(e) =>
                setForm((s) => ({ ...s, engineSize: e.target.value }))
              }
              placeholder="VD: 2.5"
              required
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Loại nhiên liệu
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.fuelType}
              onChange={(e) =>
                setForm((s) => ({ ...s, fuelType: e.target.value }))
              }
              required
            >
              <option value="Petrol">Xăng (Petrol)</option>
              <option value="Gasoline">Xăng (Gasoline)</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Điện</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium mb-1">Hộp số</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.transmission}
              onChange={(e) =>
                setForm((s) => ({ ...s, transmission: e.target.value }))
              }
              required
            >
              <option value="Automatic">Tự động</option>
              <option value="Manual">Số sàn</option>
              <option value="CVT">CVT</option>
            </select>
          </div>

          {/* Drive Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Dẫn động</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.driveType}
              onChange={(e) =>
                setForm((s) => ({ ...s, driveType: e.target.value }))
              }
              required
            >
              <option value="FWD">Cầu trước (FWD)</option>
              <option value="RWD">Cầu sau (RWD)</option>
              <option value="AWD">Bốn bánh (AWD)</option>
              <option value="4WD">Bốn bánh (4WD)</option>
            </select>
          </div>

          {/* Doors */}
          <div>
            <label className="block text-sm font-medium mb-1">Số cửa</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.doors}
              onChange={(e) =>
                setForm((s) => ({ ...s, doors: e.target.value }))
              }
              placeholder="VD: 4"
              required
            />
          </div>

          {/* Seats */}
          <div>
            <label className="block text-sm font-medium mb-1">Số ghế</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.seats}
              onChange={(e) =>
                setForm((s) => ({ ...s, seats: e.target.value }))
              }
              placeholder="VD: 5"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-1">Màu sắc</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.color}
              onChange={(e) =>
                setForm((s) => ({ ...s, color: e.target.value }))
              }
              placeholder="VD: Đen"
              required
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium mb-1">Số km</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.mileage}
              onChange={(e) =>
                setForm((s) => ({ ...s, mileage: e.target.value }))
              }
              placeholder="VD: 0"
              required
            />
          </div>

          {/* Video Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Video (từ thiết bị)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full border rounded-md px-3 py-2"
            />
            {videoPreview && (
              <div className="mt-2 relative">
                <video
                  src={videoPreview}
                  controls
                  className="max-w-full h-48 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Hình ảnh (từ thiết bị, có thể chọn nhiều)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border rounded-md px-3 py-2"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {form.imagePaths && selectedImages.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Hình ảnh hiện tại: {form.imagePaths}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              value={form.shortDescription}
              onChange={(e) =>
                setForm((s) => ({ ...s, shortDescription: e.target.value }))
              }
              placeholder="Mô tả ngắn về xe"
              rows={3}
              required
            />
          </div>

          {/* Detailed Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              value={form.detailedDescription}
              onChange={(e) =>
                setForm((s) => ({ ...s, detailedDescription: e.target.value }))
              }
              placeholder="Mô tả chi tiết về xe"
              rows={5}
            />
          </div>

          {/* Is Feature */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeature}
                onChange={(e) =>
                  setForm((s) => ({ ...s, isFeature: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Xe nổi bật</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md border"
            onClick={() =>
              setForm({
                carCode: "",
                vin: "",
                carName: "",
                modelYear: "",
                modelName: "",
                brandID: "",
                bodyTypeID: "",
                statusID: "",
                condition: "New",
                locationID: "",
                price: "",
                importPrice: "",
                salePrice: "",
                engineSize: "",
                fuelType: "Petrol",
                transmission: "Automatic",
                driveType: "FWD",
                doors: "4",
                seats: "",
                color: "Đen",
                mileage: "",
                imagePaths: "",
                detailedDescription: "",
                shortDescription: "",
                isFeature: false,
              })
            }
            disabled={createCar.isPending}
          >
            Làm mới
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            disabled={!canSubmit || createCar.isPending}
          >
            {createCar.isPending ? "Đang tạo..." : "Tạo xe"}
          </button>
        </div>
      </form>
    </div>
  );
};

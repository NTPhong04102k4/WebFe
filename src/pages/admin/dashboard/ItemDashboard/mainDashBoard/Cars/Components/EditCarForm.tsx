import React from "react";
import { useBodyType } from "src/shared/hooks/BodyType";
import { useLocation } from "src/shared/hooks/location";
import { useCarMutation } from "src/shared/hooks/Car";
import { CarResponseItem } from "src/shared/types/Reponse/Car";
import { CarDetailUpdateRequest } from "src/shared/types/Request/Car";
import { useAuth } from "src/shared/hooks/auth";

type Condition = "New" | "Used" | "Certified";

export interface EditCarFormProps {
  car: CarResponseItem;
  onUpdated?: () => void;
  onCancel?: () => void;
}

export const EditCarForm: React.FC<EditCarFormProps> = ({
  car,
  onUpdated,
  onCancel,
}) => {
  const { bodyTypes, loading: bodiesLoading } = useBodyType();
  const { locations, loading: locationsLoading } = useLocation();
  const { update, isUpdating } = useCarMutation();
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = React.useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<{
    carName: string;
    modelYear: string | number;
    modelName: string;
    bodyTypeID: string | number;
    statusID: string | number;
    condition: Condition;
    locationID: string | number;
    price: string | number;
    importPrice: string | number | null;
    salePrice: string | number;
    engineSize: string | number;
    fuelType: string;
    transmission: string;
    driveType: string;
    doors: string | number;
    seats: string | number;
    color: string;
    mileage: string | number;
    videoPath: string | null;
    imagePaths: string;
    detailedDescription: string | null;
    shortDescription: string;
    isFeature: boolean;
  }>({
    carName: car.carName || "",
    modelYear: car.modelYear || "",
    modelName: car.modelName || "",
    bodyTypeID: car.bodyTypeID || "",
    statusID: car.statusID || "",
    condition: (car.condition || "New") as Condition,
    locationID: car.locationID || 1,
    doors: car.doors || "4",
    color: car.color || "Đen",
    price: car.price || "",
    importPrice: car.importPrice || "",
    salePrice: car.salePrice || "",
    engineSize: String(car.engineSize || ""),
    fuelType: car.fuelType || "",
    transmission: String(car.transmission || ""),
    driveType: car.driveType || "",
    seats: car.seats || "",
    mileage: car.mileage || "",
    videoPath: car.videoPath || "",
    imagePaths: Array.isArray(car.imagePaths)
      ? car.imagePaths.join(", ")
      : typeof car.imagePaths === "string"
      ? car.imagePaths
      : "",
    detailedDescription: car.detailedDescription || "",
    shortDescription: car.shortDescription || "",
    isFeature: car.isFeature || false,
  });

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

  // Handle video selection
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

    // Parse imagePaths back to array
    const imagePathsArray = form.imagePaths
      ? form.imagePaths
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      : [];

    const updateData: CarDetailUpdateRequest = {
      userUUID: user?.userUUID || "",
      roles: "", // TODO: Get roles from user or API
      carCode: car.carCode,
      vin: car.vin,
      carName: form.carName,
      brandID: car.brandID,
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
      videoPath: form.videoPath || null,
      imagePaths: imagePathsArray,
      detailedDescription: form.detailedDescription || null,
      shortDescription: form.shortDescription,
      isFeature: form.isFeature,
      viewCount: car.viewCount,
      soldDate: "", // TODO: Get from car data if available
      createdBy: 0, // TODO: Get from car data if available
      isActive: true, // TODO: Get from car data if available
    };

    // Create FormData for multipart/form-data
    // API expects PascalCase field names
    const formData = new FormData();

    // Append all fields with PascalCase names as per API spec
    formData.append("userUUID", updateData.userUUID || "");
    formData.append("roles", updateData.roles || "");
    formData.append("CarCode", updateData.carCode || "");
    formData.append("VIN", updateData.vin || "");
    formData.append("CarName", updateData.carName || "");
    formData.append("BrandID", String(updateData.brandID || 0));
    formData.append("ModelName", updateData.modelName || "");
    formData.append("ModelYear", String(updateData.modelYear || 0));
    formData.append("BodyTypeID", String(updateData.bodyTypeID || 0));
    formData.append("StatusID", String(updateData.statusID || 0));
    formData.append("Condition", updateData.condition || "");
    formData.append("LocationID", String(updateData.locationID || 0));
    formData.append("Price", String(updateData.price || 0));
    formData.append("ImportPrice", String(updateData.importPrice || 0));
    formData.append("SalePrice", String(updateData.salePrice || 0));
    formData.append("EngineSize", String(updateData.engineSize || 0));
    formData.append("FuelType", updateData.fuelType || "");
    formData.append("Transmission", updateData.transmission || "");
    formData.append("DriveType", updateData.driveType || "");
    formData.append("Doors", String(updateData.doors || 0));
    formData.append("Seats", String(updateData.seats || 0));
    formData.append("Color", updateData.color || "");
    formData.append("Mileage", String(updateData.mileage || 0));
    formData.append(
      "DetailedDescription",
      updateData.detailedDescription || ""
    );
    formData.append("ShortDescription", updateData.shortDescription || "");
    formData.append("IsFeature", String(updateData.isFeature || false));
    formData.append("ViewCount", String(updateData.viewCount || 0));
    formData.append("SoldDate", updateData.soldDate || "");
    formData.append("CreatedBy", String(updateData.createdBy || 0));
    formData.append("IsActive", String(updateData.isActive || false));

    // Append image files (API expects ImageFiles array)
    selectedImages.forEach((image) => {
      formData.append("ImageFiles", image);
    });

    // Append video file (API expects VideoFile)
    if (selectedVideo) {
      formData.append("VideoFile", selectedVideo);
    }

    update(
      { id: car.carID, data: formData as any },
      {
        onSuccess: () => {
          onUpdated?.();
        },
        onError: (error) => {
          console.error("Error updating car:", error);
          alert("Có lỗi xảy ra khi cập nhật xe");
        },
      }
    );
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-base font-semibold mb-4">Chỉnh sửa xe</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Dòng xe</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={
                typeof form.bodyTypeID === "number"
                  ? bodyTypes.find((t, idx) => idx + 1 === form.bodyTypeID)
                      ?.bodyCode || ""
                  : form.bodyTypeID
              }
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
              value={
                typeof form.locationID === "number"
                  ? locations.find((loc, idx) => idx + 1 === form.locationID)
                      ?.locationCode || ""
                  : form.locationID
              }
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
              value={form.importPrice ?? ""}
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
            {form.videoPath && !selectedVideo && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Video hiện tại:</p>
                <video
                  src={form.videoPath}
                  controls
                  className="max-w-full h-48 rounded-md"
                />
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
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Hình ảnh hiện tại:</p>
                <div className="grid grid-cols-4 gap-2">
                  {form.imagePaths.split(",").map((path, index) => (
                    <img
                      key={index}
                      src={path.trim()}
                      alt={`${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </div>
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
              value={form.detailedDescription ?? ""}
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
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 rounded-md border"
              onClick={onCancel}
              disabled={isUpdating}
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật xe"}
          </button>
        </div>
      </form>
    </div>
  );
};

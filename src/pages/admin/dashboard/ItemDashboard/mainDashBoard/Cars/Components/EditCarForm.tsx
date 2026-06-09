import React from "react";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { useLocationList } from "src/query/location/useLocationQueries";
import { useCarDetail, useCarMutations } from "src/query/car/useCarQueries";
import { useAuth } from "src/shared/hooks/auth";

type Condition = "New" | "Used" | "Certified";

// Backend returns imagePaths as a JSON-serialized array string, e.g. '["https://...","https://..."]'
function parseImagePaths(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON — fall back to comma-separated string
    }
    return value.split(",").map((p) => p.trim()).filter(Boolean);
  }
  return [];
}

export interface EditCarFormProps {
  carId: number;
  onUpdated?: () => void;
  onCancel?: () => void;
}

export const EditCarForm: React.FC<EditCarFormProps> = ({
  carId,
  onUpdated,
  onCancel,
}) => {
  const { data: car, isLoading: carLoading } = useCarDetail(carId);
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList();
  const { data: locations = [], isLoading: locationsLoading } = useLocationList();
  const { updateCar } = useCarMutations();
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = React.useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<{
    carName: string;
    modelYear: string | number;
    modelName: string;
    bodyTypeID: number;
    statusID: number;
    condition: Condition;
    locationID: number;
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
  } | null>(null);

  // Populate form once car detail is loaded
  React.useEffect(() => {
    if (!car) return;
    setForm({
      carName: car.carName || "",
      modelYear: car.modelYear || "",
      modelName: car.modelName || "",
      bodyTypeID: car.bodyTypeID || 0,
      statusID: car.statusID || 0,
      condition: (car.condition || "New") as Condition,
      locationID: car.locationID || 0,
      doors: car.doors || 4,
      color: car.color || "Đen",
      price: car.price || "",
      importPrice: car.importPrice ?? "",
      salePrice: car.salePrice || "",
      engineSize: String(car.engineSize || ""),
      fuelType: car.fuelType || "Petrol",
      transmission: car.transmission || "Automatic",
      driveType: car.driveType || "FWD",
      seats: car.seats || "",
      mileage: car.mileage || "",
      videoPath: car.videoPath || "",
      imagePaths: parseImagePaths(car.imagePaths).join(", "),
      detailedDescription: car.detailedDescription || "",
      shortDescription: car.shortDescription || "",
      isFeature: car.isFeature || false,
    });
  }, [car]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages((prev) => [...prev, ...fileArray]);
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

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !car) return;

    const formData = new FormData();
    formData.append("userUUID", user?.userUUID || "");
    formData.append("roles", user?.role || "");
    formData.append("CarCode", car.carCode || "");
    formData.append("VIN", car.vin || "");
    formData.append("CarName", form.carName || "");
    formData.append("BrandID", String(car.brandID || 0));
    formData.append("ModelName", form.modelName || "");
    formData.append("ModelYear", String(form.modelYear || 0));
    formData.append("BodyTypeID", String(form.bodyTypeID || 0));
    formData.append("StatusID", String(form.statusID || 0));
    formData.append("Condition", form.condition || "");
    formData.append("LocationID", String(form.locationID || 0));
    formData.append("Price", String(form.price || 0));
    formData.append("ImportPrice", String(form.importPrice || 0));
    formData.append("SalePrice", String(form.salePrice || 0));
    formData.append("EngineSize", String(form.engineSize || 0));
    formData.append("FuelType", form.fuelType || "");
    formData.append("Transmission", form.transmission || "");
    formData.append("DriveType", form.driveType || "");
    formData.append("Doors", String(form.doors || 0));
    formData.append("Seats", String(form.seats || 0));
    formData.append("Color", form.color || "");
    formData.append("Mileage", String(form.mileage || 0));
    formData.append("DetailedDescription", form.detailedDescription || "");
    formData.append("ShortDescription", form.shortDescription || "");
    formData.append("IsFeature", String(form.isFeature || false));
    formData.append("ViewCount", String(car.viewCount || 0));
    formData.append("SoldDate", car.soldDate || "");
    formData.append("CreatedBy", String(car.createdBy || 0));
    formData.append("IsActive", String(car.isActive ?? true));

    selectedImages.forEach((image) => {
      formData.append("ImageFiles", image);
    });

    if (selectedVideo) {
      formData.append("VideoFile", selectedVideo);
    }

    updateCar.mutate(
      { id: carId, data: formData as any },
      {
        onSuccess: () => {
          onUpdated?.();
        },
        onError: (error) => {
          console.error("Error updating car:", error);
        },
      }
    );
  };

  if (carLoading || !form) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-gray-500">Đang tải thông tin xe...</span>
      </div>
    );
  }

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
                setForm((s) => s && ({ ...s, carName: e.target.value }))
              }
              placeholder="VD: Toyota Camry 2.5Q 2024"
              required
            />
          </div>

          {/* Model Year */}
          <div>
            <label className="block text-sm font-medium mb-1">Năm sản xuất</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.modelYear}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, modelYear: e.target.value }))
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
                setForm((s) => s && ({ ...s, modelName: e.target.value }))
              }
              placeholder="VD: Camry"
              required
            />
          </div>

          {/* Body Type — dùng bodyTypeID thực từ API */}
          <div>
            <label className="block text-sm font-medium mb-1">Dòng xe</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.bodyTypeID}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, bodyTypeID: Number(e.target.value) }))
              }
              disabled={bodiesLoading}
              required
            >
              <option value={0} disabled>Chọn dòng xe</option>
              {bodyTypes.map((t) => (
                <option key={t.bodyTypeID} value={t.bodyTypeID}>
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
                setForm((s) => s && ({ ...s, statusID: Number(e.target.value) }))
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
                setForm((s) =>
                  s && ({ ...s, condition: e.target.value as Condition })
                )
              }
              required
            >
              <option value="New">Xe mới</option>
              <option value="Used">Xe cũ</option>
              <option value="Certified">Xe cũ đã chứng nhận</option>
            </select>
          </div>

          {/* Location — dùng locationID thực từ API */}
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.locationID}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, locationID: Number(e.target.value) }))
              }
              disabled={locationsLoading}
              required
            >
              <option value={0} disabled>Chọn địa điểm</option>
              {locations.map((loc) => (
                <option key={loc.locationID} value={loc.locationID}>
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
                setForm((s) => s && ({ ...s, price: e.target.value }))
              }
              placeholder="VD: 1450000000"
              required
            />
          </div>

          {/* Import Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá nhập (VND)</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.importPrice ?? ""}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, importPrice: e.target.value }))
              }
              placeholder="VD: 1400000000"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá bán (VND)</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={form.salePrice}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, salePrice: e.target.value }))
              }
              placeholder="VD: 1445000000"
              required
            />
          </div>

          {/* Engine Size */}
          <div>
            <label className="block text-sm font-medium mb-1">Dung tích động cơ (L)</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded-md px-3 py-2"
              value={form.engineSize}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, engineSize: e.target.value }))
              }
              placeholder="VD: 2.5"
              required
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Loại nhiên liệu</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.fuelType}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, fuelType: e.target.value }))
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
                setForm((s) => s && ({ ...s, transmission: e.target.value }))
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
                setForm((s) => s && ({ ...s, driveType: e.target.value }))
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
                setForm((s) => s && ({ ...s, doors: e.target.value }))
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
                setForm((s) => s && ({ ...s, seats: e.target.value }))
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
                setForm((s) => s && ({ ...s, color: e.target.value }))
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
                setForm((s) => s && ({ ...s, mileage: e.target.value }))
              }
              placeholder="VD: 0"
              required
            />
          </div>

          {/* Video Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Video (từ thiết bị)</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full border rounded-md px-3 py-2"
            />
            {videoPreview && (
              <div className="mt-2 relative">
                <video src={videoPreview} controls className="max-w-full h-48 rounded-md" />
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
                <video src={form.videoPath} controls className="max-w-full h-48 rounded-md" />
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
                      x
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
                setForm((s) => s && ({ ...s, shortDescription: e.target.value }))
              }
              placeholder="Mô tả ngắn về xe"
              rows={3}
              required
            />
          </div>

          {/* Detailed Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              value={form.detailedDescription ?? ""}
              onChange={(e) =>
                setForm((s) => s && ({ ...s, detailedDescription: e.target.value }))
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
                  setForm((s) => s && ({ ...s, isFeature: e.target.checked }))
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
              disabled={updateCar.isPending}
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            disabled={updateCar.isPending}
          >
            {updateCar.isPending ? "Đang cập nhật..." : "Cập nhật xe"}
          </button>
        </div>
      </form>
    </div>
  );
};

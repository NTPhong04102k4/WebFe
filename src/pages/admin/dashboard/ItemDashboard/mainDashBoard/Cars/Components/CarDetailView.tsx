import React from "react";
import { CarResponseItem } from "src/shared/types/Reponse/Car";
import { useCarTechSpec } from "src/query/car/useCarQueries";
import { TechSpecForm } from "./TechSpecForm";

export interface CarDetailViewProps {
  car: CarResponseItem;
  onBack: () => void;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({
  car,
  onBack,
}) => {
  const [showSpecForm, setShowSpecForm] = React.useState(false);
  const { data: techSpec, isLoading, error, refetch } = useCarTechSpec(car.carID);

  const hasSpec = React.useMemo(() => {
    if (error) return false;
    if (!techSpec) return false;
    // Check if spec has meaningful data (at least one required field)
    return (
      techSpec.length_mm > 0 ||
      techSpec.width_mm > 0 ||
      techSpec.height_mm > 0 ||
      techSpec.curbWeight_kg > 0
    );
  }, [techSpec, error]);

  const getImageUrl = (): string | null => {
    if (car.primaryImagePath) {
      if (typeof car.primaryImagePath === "string") {
        return car.primaryImagePath;
      }
      if (typeof car.primaryImagePath === "object") {
        return (
          (car.primaryImagePath as any)?.url ||
          (car.primaryImagePath as any)?.path ||
          null
        );
      }
    }

    if (car.imagePaths) {
      let images: any[] = [];

      if (typeof car.imagePaths === "string") {
        const imagePathsStr = car.imagePaths as string;
        images = imagePathsStr.split(",").map((s: string) => s.trim());
      } else if (Array.isArray(car.imagePaths)) {
        images = car.imagePaths;
      }

      if (images.length > 0) {
        const firstImage = images[0];
        if (typeof firstImage === "string") {
          return firstImage;
        }
        if (typeof firstImage === "object" && firstImage !== null) {
          return (firstImage as any)?.url || (firstImage as any)?.path || null;
        }
      }
    }

    return null;
  };

  const imageUrl = getImageUrl();

  const handleSpecSaved = () => {
    setShowSpecForm(false);
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chi tiết xe</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ← Quay lại
        </button>
      </div>

      <div className="border rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={car.carName}
                className="w-full h-auto rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                Không có hình ảnh
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{car.carName}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã xe:</span>
                  <span className="font-medium">{car.carCode || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VIN:</span>
                  <span className="font-medium">{car.vin || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Năm sản xuất:</span>
                  <span className="font-medium">{car.modelYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên model:</span>
                  <span className="font-medium">{car.modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tình trạng:</span>
                  <span className="font-medium">{car.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-medium">
                    {car.price?.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá bán:</span>
                  <span className="font-medium">
                    {car.salePrice?.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dung tích động cơ:</span>
                  <span className="font-medium">{car.engineSize}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại nhiên liệu:</span>
                  <span className="font-medium">{car.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hộp số:</span>
                  <span className="font-medium">{car.transmission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dẫn động:</span>
                  <span className="font-medium">{car.driveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số cửa:</span>
                  <span className="font-medium">{car.doors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số ghế:</span>
                  <span className="font-medium">{car.seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Màu sắc:</span>
                  <span className="font-medium">{car.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số km:</span>
                  <span className="font-medium">
                    {car.mileage?.toLocaleString("vi-VN")} km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h4 className="text-base font-semibold mb-2">Mô tả ngắn</h4>
          <p className="text-sm text-gray-700">
            {car.shortDescription || "N/A"}
          </p>
        </div>

        {car.detailedDescription && (
          <div className="mt-4">
            <h4 className="text-base font-semibold mb-2">Mô tả chi tiết</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {car.detailedDescription}
            </p>
          </div>
        )}

        {/* Tech Spec Section */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold">Thông số kỹ thuật</h4>
            <button
              onClick={() => setShowSpecForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {hasSpec ? "Chỉnh sửa spec" : "Tạo mới spec"}
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : hasSpec && techSpec ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Chiều dài (mm):</span>
                <span className="font-medium">{techSpec.length_mm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chiều rộng (mm):</span>
                <span className="font-medium">{techSpec.width_mm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chiều cao (mm):</span>
                <span className="font-medium">{techSpec.height_mm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chiều dài cơ sở (mm):</span>
                <span className="font-medium">{techSpec.wheelbase_mm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Độ cao gầm (mm):</span>
                <span className="font-medium">
                  {techSpec.groundClearance_mm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Trọng lượng không tải (kg):
                </span>
                <span className="font-medium">{techSpec.curbWeight_kg}</span>
              </div>
              {techSpec.grossWeight_kg && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Trọng lượng toàn tải (kg):
                  </span>
                  <span className="font-medium">{techSpec.grossWeight_kg}</span>
                </div>
              )}
              {techSpec.payloadCapacity_kg && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tải trọng (kg):</span>
                  <span className="font-medium">
                    {techSpec.payloadCapacity_kg}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Mã động cơ:</span>
                <span className="font-medium">{techSpec.engineCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số xi-lanh:</span>
                <span className="font-medium">{techSpec.cylinders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Công suất tối đa (hp):</span>
                <span className="font-medium">{techSpec.maxPower_hp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mô-men xoắn tối đa (Nm):</span>
                <span className="font-medium">{techSpec.maxTorque_nm}</span>
              </div>
              {techSpec.compression_ratio && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ số nén:</span>
                  <span className="font-medium">
                    {techSpec.compression_ratio}
                  </span>
                </div>
              )}
              {techSpec.topSpeed_kmh && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tốc độ tối đa (km/h):</span>
                  <span className="font-medium">{techSpec.topSpeed_kmh}</span>
                </div>
              )}
              {techSpec.acceleration_0_100_sec && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Gia tốc 0-100km/h (giây):
                  </span>
                  <span className="font-medium">
                    {techSpec.acceleration_0_100_sec}
                  </span>
                </div>
              )}
              {techSpec.fuelConsumption_city_l100km && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tiêu thụ - Thành phố (L/100km):
                  </span>
                  <span className="font-medium">
                    {techSpec.fuelConsumption_city_l100km}
                  </span>
                </div>
              )}
              {techSpec.fuelConsumption_highway_l100km && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tiêu thụ - Cao tốc (L/100km):
                  </span>
                  <span className="font-medium">
                    {techSpec.fuelConsumption_highway_l100km}
                  </span>
                </div>
              )}
              {techSpec.fuelConsumption_combined_l100km && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tiêu thụ - Kết hợp (L/100km):
                  </span>
                  <span className="font-medium">
                    {techSpec.fuelConsumption_combined_l100km}
                  </span>
                </div>
              )}
              {techSpec.fuelTankCapacity_l && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Dung tích bình xăng (L):
                  </span>
                  <span className="font-medium">
                    {techSpec.fuelTankCapacity_l}
                  </span>
                </div>
              )}
              {techSpec.safetyRating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá an toàn:</span>
                  <span className="font-medium">{techSpec.safetyRating}</span>
                </div>
              )}
              {techSpec.airbags && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số túi khí:</span>
                  <span className="font-medium">{techSpec.airbags}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">ABS:</span>
                <span className="font-medium">
                  {techSpec.abs ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ESP:</span>
                <span className="font-medium">
                  {techSpec.esp ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điều hòa:</span>
                <span className="font-medium">
                  {techSpec.airConditioning ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cửa sổ trời:</span>
                <span className="font-medium">
                  {techSpec.sunRoof ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ghế da:</span>
                <span className="font-medium">
                  {techSpec.leatherSeats ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hệ thống định vị:</span>
                <span className="font-medium">
                  {techSpec.navigationSystem ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bluetooth:</span>
                <span className="font-medium">
                  {techSpec.bluetoothConnectivity ? "Có" : "Không"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Chưa có thông số kỹ thuật. Nhấn "Tạo mới spec" để thêm thông số.
            </p>
          )}
        </div>
      </div>

      {/* Tech Spec Form Modal */}
      {showSpecForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {hasSpec
                  ? "Chỉnh sửa thông số kỹ thuật"
                  : "Tạo mới thông số kỹ thuật"}
              </h3>
              <button
                onClick={() => setShowSpecForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <TechSpecForm
              carId={car.carID}
              initialData={hasSpec ? techSpec ?? undefined : undefined}
              onSaved={handleSpecSaved}
              onCancel={() => setShowSpecForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

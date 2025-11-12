import React from "react";
import { useCarTechSpec } from "src/shared/hooks/Car";
import { CarDetailResponse } from "src/shared/types/Reponse/Car";
import { TechSpecDetailUpdateRequest } from "src/shared/types/Request/Car";

export interface TechSpecFormProps {
  carId: number;
  initialData?: CarDetailResponse;
  onSaved?: () => void;
  onCancel?: () => void;
}

export const TechSpecForm: React.FC<TechSpecFormProps> = ({
  carId,
  initialData,
  onSaved,
  onCancel,
}) => {
  const {
    createTechSpec,
    updateTechSpec,
    isCreatingTechSpec,
    isUpdatingTechSpec,
  } = useCarTechSpec(carId);

  // Use a more flexible form state that allows empty strings
  const [form, setForm] = React.useState<{
    carID: number;
    length_mm: number | "";
    width_mm: number | "";
    height_mm: number | "";
    wheelbase_mm: number | "";
    groundClearance_mm: number | "";
    curbWeight_kg: number | "";
    grossWeight_kg: number | "" | null;
    payloadCapacity_kg: number | "" | null;
    engineCode: string;
    cylinders: number | "";
    maxPower_hp: number | "";
    maxTorque_nm: number | "";
    compression_ratio: number | "" | null;
    topSpeed_kmh: number | "" | null;
    acceleration_0_100_sec: number | "" | null;
    fuelConsumption_city_l100km: number | "" | null;
    fuelConsumption_highway_l100km: number | "" | null;
    fuelConsumption_combined_l100km: number | "" | null;
    fuelTankCapacity_l: number | "" | null;
    safetyRating: string | null;
    airbags: number | "" | null;
    abs: boolean;
    esp: boolean;
    airConditioning: boolean;
    sunRoof: boolean;
    leatherSeats: boolean;
    navigationSystem: boolean;
    bluetoothConnectivity: boolean;
  }>({
    carID: carId,
    length_mm: "",
    width_mm: "",
    height_mm: "",
    wheelbase_mm: "",
    groundClearance_mm: "",
    curbWeight_kg: "",
    grossWeight_kg: "",
    payloadCapacity_kg: "",
    engineCode: "",
    cylinders: "",
    maxPower_hp: "",
    maxTorque_nm: "",
    compression_ratio: "",
    topSpeed_kmh: "",
    acceleration_0_100_sec: "",
    fuelConsumption_city_l100km: "",
    fuelConsumption_highway_l100km: "",
    fuelConsumption_combined_l100km: "",
    fuelTankCapacity_l: "",
    safetyRating: "",
    airbags: "",
    abs: false,
    esp: false,
    airConditioning: false,
    sunRoof: false,
    leatherSeats: false,
    navigationSystem: false,
    bluetoothConnectivity: false,
  });

  const isEditMode = !!initialData;

  // Load initial data if editing
  React.useEffect(() => {
    if (initialData && isEditMode) {
      setForm({
        carID: carId,
        length_mm: initialData.length_mm || "",
        width_mm: initialData.width_mm || "",
        height_mm: initialData.height_mm || "",
        wheelbase_mm: initialData.wheelbase_mm || "",
        groundClearance_mm: initialData.groundClearance_mm || "",
        curbWeight_kg: initialData.curbWeight_kg || "",
        grossWeight_kg: initialData.grossWeight_kg ?? "",
        payloadCapacity_kg: initialData.payloadCapacity_kg ?? "",
        engineCode: initialData.engineCode || "",
        cylinders: initialData.cylinders || "",
        maxPower_hp: initialData.maxPower_hp || "",
        maxTorque_nm: initialData.maxTorque_nm || "",
        compression_ratio: initialData.compression_ratio ?? "",
        topSpeed_kmh: initialData.topSpeed_kmh ?? "",
        acceleration_0_100_sec: initialData.acceleration_0_100_sec ?? "",
        fuelConsumption_city_l100km:
          initialData.fuelConsumption_city_l100km ?? "",
        fuelConsumption_highway_l100km:
          initialData.fuelConsumption_highway_l100km ?? "",
        fuelConsumption_combined_l100km:
          initialData.fuelConsumption_combined_l100km ?? "",
        fuelTankCapacity_l: initialData.fuelTankCapacity_l ?? "",
        safetyRating: initialData.safetyRating ?? "",
        airbags: initialData.airbags ?? "",
        abs: initialData.abs ?? false,
        esp: initialData.esp ?? false,
        airConditioning: initialData.airConditioning ?? false,
        sunRoof: initialData.sunRoof ?? false,
        leatherSeats: initialData.leatherSeats ?? false,
        navigationSystem: initialData.navigationSystem ?? false,
        bluetoothConnectivity: initialData.bluetoothConnectivity ?? false,
      });
    }
  }, [initialData, isEditMode, carId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate carId
    if (!carId || carId <= 0) {
      alert("Lỗi: Car ID không hợp lệ");
      console.error("Invalid carId:", carId);
      return;
    }

    // Convert form data to proper types, converting empty strings to 0 for required fields
    // and null for optional fields
    // Ensure values are within safe numeric range to avoid SQL overflow
    const convertValue = (value: number | "" | null): number | null => {
      if (value === "" || value === null || value === undefined) return null;
      const num = typeof value === "number" ? value : Number(value);
      if (isNaN(num)) return null;
      // Ensure value is within safe range (prevent overflow)
      if (num > 999999999 || num < -999999999) {
        console.warn("Value out of safe range:", num);
        return null;
      }
      return num;
    };

    const convertRequiredValue = (value: number | ""): number => {
      if (value === "" || value === undefined) return 0;
      const num = typeof value === "number" ? value : Number(value);
      if (isNaN(num)) return 0;
      // Ensure value is within safe range (prevent overflow)
      if (num > 999999999 || num < -999999999) {
        console.warn("Value out of safe range:", num);
        return 0;
      }
      return num;
    };

    const submitData: TechSpecDetailUpdateRequest = {
      carID: carId,
      length_mm: convertRequiredValue(form.length_mm),
      width_mm: convertRequiredValue(form.width_mm),
      height_mm: convertRequiredValue(form.height_mm),
      wheelbase_mm: convertRequiredValue(form.wheelbase_mm),
      groundClearance_mm: convertRequiredValue(form.groundClearance_mm),
      curbWeight_kg: convertRequiredValue(form.curbWeight_kg),
      grossWeight_kg: convertValue(form.grossWeight_kg),
      payloadCapacity_kg: convertValue(form.payloadCapacity_kg),
      engineCode: form.engineCode || "",
      cylinders: convertRequiredValue(form.cylinders),
      maxPower_hp: convertRequiredValue(form.maxPower_hp),
      maxTorque_nm: convertRequiredValue(form.maxTorque_nm),
      compression_ratio: convertValue(form.compression_ratio),
      topSpeed_kmh: convertValue(form.topSpeed_kmh),
      acceleration_0_100_sec: convertValue(form.acceleration_0_100_sec),
      fuelConsumption_city_l100km: convertValue(
        form.fuelConsumption_city_l100km
      ),
      fuelConsumption_highway_l100km: convertValue(
        form.fuelConsumption_highway_l100km
      ),
      fuelConsumption_combined_l100km: convertValue(
        form.fuelConsumption_combined_l100km
      ),
      fuelTankCapacity_l: convertValue(form.fuelTankCapacity_l),
      safetyRating: form.safetyRating || null,
      airbags: convertValue(form.airbags),
      abs: form.abs,
      esp: form.esp,
      airConditioning: form.airConditioning,
      sunRoof: form.sunRoof,
      leatherSeats: form.leatherSeats,
      navigationSystem: form.navigationSystem,
      bluetoothConnectivity: form.bluetoothConnectivity,
    };

    console.log("📤 Submitting tech spec:", {
      carId,
      isEditMode,
      submitData,
    });

    if (isEditMode) {
      updateTechSpec(
        { id: carId, data: submitData },
        {
          onSuccess: () => {
            onSaved?.();
          },
          onError: (error) => {
            console.error("Error updating tech spec:", error);
            alert("Có lỗi xảy ra khi cập nhật thông số kỹ thuật");
          },
        }
      );
    } else {
      console.log(form);
      console.log(submitData);
      createTechSpec(
        { id: carId, data: submitData },
        {
          onSuccess: () => {
            onSaved?.();
          },
          onError: (error) => {
            console.error("Error creating tech spec:", error);
            const errorMessage =
              (error as any)?.response?.data?.message ||
              error?.message ||
              "Có lỗi xảy ra khi tạo thông số kỹ thuật";
            alert(errorMessage);
          },
        }
      );
    }
  };

  const isLoading = isCreatingTechSpec || isUpdatingTechSpec;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dimensions */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Chiều dài (mm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.length_mm === "" ? "" : form.length_mm}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                length_mm: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Chiều rộng (mm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.width_mm === "" ? "" : form.width_mm}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                width_mm: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Chiều cao (mm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.height_mm === "" ? "" : form.height_mm}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                height_mm: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Chiều dài cơ sở (mm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.wheelbase_mm === "" ? "" : form.wheelbase_mm}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                wheelbase_mm:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Độ cao gầm (mm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={
              form.groundClearance_mm === "" ? "" : form.groundClearance_mm
            }
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                groundClearance_mm:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Trọng lượng không tải (kg) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.curbWeight_kg === "" ? "" : form.curbWeight_kg}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                curbWeight_kg:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Trọng lượng toàn tải (kg)
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.grossWeight_kg || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                grossWeight_kg: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tải trọng (kg)
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.payloadCapacity_kg || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                payloadCapacity_kg: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        {/* Engine */}
        <div>
          <label className="block text-sm font-medium mb-1">Mã động cơ *</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={form.engineCode}
            onChange={(e) =>
              setForm((s) => ({ ...s, engineCode: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Số xi-lanh *</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.cylinders === "" ? "" : form.cylinders}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                cylinders: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Công suất tối đa (hp) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.maxPower_hp === "" ? "" : form.maxPower_hp}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                maxPower_hp:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mô-men xoắn tối đa (Nm) *
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.maxTorque_nm === "" ? "" : form.maxTorque_nm}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                maxTorque_nm:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            required
          />
        </div>

        {/* Engine Performance */}
        <div>
          <label className="block text-sm font-medium mb-1">Tỷ số nén</label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.compression_ratio || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                compression_ratio: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tốc độ tối đa (km/h)
          </label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.topSpeed_kmh || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                topSpeed_kmh: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Gia tốc 0-100km/h (giây)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.acceleration_0_100_sec || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                acceleration_0_100_sec: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        {/* Fuel Consumption */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tiêu thụ nhiên liệu - Thành phố (L/100km)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.fuelConsumption_city_l100km || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                fuelConsumption_city_l100km: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tiêu thụ nhiên liệu - Cao tốc (L/100km)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.fuelConsumption_highway_l100km || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                fuelConsumption_highway_l100km: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tiêu thụ nhiên liệu - Kết hợp (L/100km)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.fuelConsumption_combined_l100km || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                fuelConsumption_combined_l100km: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Dung tích bình xăng (L)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded-md px-3 py-2"
            value={form.fuelTankCapacity_l || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                fuelTankCapacity_l: e.target.value
                  ? Number(e.target.value)
                  : null,
              }))
            }
          />
        </div>

        {/* Safety */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Đánh giá an toàn (tối đa 10 ký tự)
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={form.safetyRating || ""}
            onChange={(e) => {
              const value = e.target.value;
              // Limit to 10 characters as per NVARCHAR(10)
              if (value.length <= 10) {
                setForm((s) => ({
                  ...s,
                  safetyRating: value || null,
                }));
              }
            }}
            placeholder="VD: 5-star, NCAP 5, 4-star"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Định dạng: 5-star, 4-star, NCAP 5, NCAP rating (tối đa 10 ký tự)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Số túi khí</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={form.airbags || ""}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                airbags: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>

        {/* Features */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold mb-2">Tính năng</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.abs}
                onChange={(e) =>
                  setForm((s) => ({ ...s, abs: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">ABS</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.esp}
                onChange={(e) =>
                  setForm((s) => ({ ...s, esp: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">ESP</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.airConditioning}
                onChange={(e) =>
                  setForm((s) => ({ ...s, airConditioning: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Điều hòa</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.sunRoof}
                onChange={(e) =>
                  setForm((s) => ({ ...s, sunRoof: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Cửa sổ trời</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.leatherSeats}
                onChange={(e) =>
                  setForm((s) => ({ ...s, leatherSeats: e.target.checked }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Ghế da</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.navigationSystem}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    navigationSystem: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Định vị</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bluetoothConnectivity}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    bluetoothConnectivity: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Bluetooth</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 rounded-md border"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading
            ? "Đang lưu..."
            : isEditMode
            ? "Cập nhật spec"
            : "Tạo spec"}
        </button>
      </div>
    </form>
  );
};

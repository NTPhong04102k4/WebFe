import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { notify } from "@/components/core/Feedback/toast";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { useCarDetail, useCarTechSpec } from "@/query/car/useCarQueries";
import { useCartStore } from "@/stores/cartStore";
import type { CarDetailResponse } from "@/shared/types/Reponse/Car";
import type { CarDetailView } from "@/services/api/functions/Cars/Routes.Fn";

function parseImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((value): value is string => typeof value === "string" && value.trim() !== "");
  }

  if (typeof raw !== "string" || !raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string" && value.trim() !== "")
      : [raw];
  } catch {
    return [raw];
  }
}

function parseCarId(value: string | undefined) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function BoolBadge({ label, value }: { label: string; value?: boolean | null }) {
  const active = value === true;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {label}
    </div>
  );
}

function CarGallery({
  images,
  activeIndex,
  carName,
  fallbackImage,
  onSelect,
}: {
  images: string[];
  activeIndex: number;
  carName: string;
  fallbackImage?: string | null;
  onSelect: (index: number) => void;
}) {
  const displayImage = images[activeIndex] ?? fallbackImage ?? null;

  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {displayImage ? (
          <img src={displayImage} alt={carName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Không có ảnh</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === activeIndex ? "border-blue-500" : "border-transparent hover:border-slate-300"
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CarInfoPanel({
  car,
  carId,
  carName,
  onAddToCart,
}: {
  car: CarDetailView;
  carId: number;
  carName: string;
  onAddToCart: () => void;
}) {
  const price = car.salePrice ?? car.price ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {car.isFeature ? (
        <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          Nổi bật
        </span>
      ) : null}

      <h1 className="text-2xl font-bold text-slate-900">{carName}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {car.modelYear} · {car.modelName} · {car.condition}
      </p>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-blue-700">{formatCurrency(price)}</div>
        {car.importPrice && car.salePrice && car.salePrice < car.importPrice * 1.2 ? (
          <p className="mt-0.5 text-sm text-slate-500 line-through">{formatCurrency(car.importPrice)}</p>
        ) : null}
      </div>

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        onClick={onAddToCart}
      >
        <ShoppingCart className="h-4 w-4" />
        Thêm vào giỏ hàng
      </button>

      <Link
        to={`/reviews/${carId}`}
        className="mt-3 flex w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100"
      >
        Viết review cho xe này
      </Link>

      <div className="mt-6 divide-y divide-slate-100">
        <DetailRow label="Mã xe" value={car.carCode} />
        <DetailRow label="Màu sắc" value={car.color} />
        <DetailRow label="Nhiên liệu" value={car.fuelType} />
        <DetailRow label="Hộp số" value={car.transmission} />
        <DetailRow label="Dẫn động" value={car.driveType} />
        <DetailRow label="Dung tích" value={car.engineSize ? `${car.engineSize}L` : null} />
        <DetailRow label="Số cửa" value={car.doors} />
        <DetailRow label="Số chỗ" value={car.seats} />
        <DetailRow label="Số km" value={car.mileage != null ? `${car.mileage.toLocaleString("vi-VN")} km` : null} />
      </div>

      {car.shortDescription ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{car.shortDescription}</p>
      ) : null}
    </div>
  );
}

function TechSpecGrid({ spec }: { spec: CarDetailResponse }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Kích thước</h3>
        <div className="divide-y divide-slate-100">
          <DetailRow label="Dài" value={spec.length_mm != null ? `${spec.length_mm} mm` : null} />
          <DetailRow label="Rộng" value={spec.width_mm != null ? `${spec.width_mm} mm` : null} />
          <DetailRow label="Cao" value={spec.height_mm != null ? `${spec.height_mm} mm` : null} />
          <DetailRow label="Chiều dài cơ sở" value={spec.wheelbase_mm != null ? `${spec.wheelbase_mm} mm` : null} />
          <DetailRow
            label="Khoảng sáng gầm"
            value={spec.groundClearance_mm != null ? `${spec.groundClearance_mm} mm` : null}
          />
          <DetailRow label="Khối lượng" value={spec.curbWeight_kg != null ? `${spec.curbWeight_kg} kg` : null} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Động cơ & Hiệu năng</h3>
        <div className="divide-y divide-slate-100">
          <DetailRow label="Mã động cơ" value={spec.engineCode} />
          <DetailRow label="Số xy lanh" value={spec.cylinders} />
          <DetailRow label="Công suất tối đa" value={spec.maxPower_hp != null ? `${spec.maxPower_hp} HP` : null} />
          <DetailRow label="Mô-men xoắn" value={spec.maxTorque_nm != null ? `${spec.maxTorque_nm} Nm` : null} />
          <DetailRow label="Tốc độ tối đa" value={spec.topSpeed_kmh != null ? `${spec.topSpeed_kmh} km/h` : null} />
          <DetailRow
            label="Dung tích bình xăng"
            value={spec.fuelTankCapacity_l != null ? `${spec.fuelTankCapacity_l} L` : null}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">An toàn & Tiện nghi</h3>
        <div className="mb-3 divide-y divide-slate-100">
          <DetailRow label="Xếp hạng an toàn" value={spec.safetyRating} />
          <DetailRow label="Túi khí" value={spec.airbags != null ? `${spec.airbags} túi` : null} />
        </div>
        <div className="flex flex-wrap gap-2">
          <BoolBadge label="ABS" value={spec.abs} />
          <BoolBadge label="ESP" value={spec.esp} />
          <BoolBadge label="Điều hòa" value={spec.airConditioning} />
          <BoolBadge label="Cửa sổ trời" value={spec.sunRoof} />
          <BoolBadge label="Ghế da" value={spec.leatherSeats} />
          <BoolBadge label="GPS" value={spec.navigationSystem} />
          <BoolBadge label="Bluetooth" value={spec.bluetoothConnectivity} />
        </div>
      </div>
    </div>
  );
}

function TechSpecSection({ techSpec }: { techSpec: ReturnType<typeof useCarTechSpec> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Thông số kỹ thuật chi tiết</h2>

      {techSpec.isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : techSpec.data ? (
        <TechSpecGrid spec={techSpec.data} />
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chưa có thông số kỹ thuật chi tiết cho xe này.</p>
      )}
    </div>
  );
}

export default function CustomerCarDetailPage() {
  const addItem = useCartStore((state) => state.addItem);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { id: routeId } = useParams();
  const carId = useMemo(() => parseCarId(routeId), [routeId]);

  const carDetail = useCarDetail(carId);
  const techSpec = useCarTechSpec(carId, true, true);

  const car = carDetail.data;
  const images = parseImages(car?.imagePaths);
  const displayImage = images[activeImageIndex] ?? car?.primaryImagePath ?? null;
  const carName = car?.carName ?? `Xe #${carId ?? ""}`;
  const price = car?.salePrice ?? car?.price ?? 0;

  const handleAddToCart = () => {
    if (!carId) {
      notify.error("Không tìm thấy mã xe");
      return;
    }

    addItem({
      type: "car",
      id: carId,
      name: carName,
      price,
      imagePath: displayImage ?? undefined,
    });
    notify.success("Đã thêm vào giỏ hàng");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link to="/cars" className="text-sm font-medium text-blue-700 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      {carDetail.isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : carDetail.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được thông tin xe. {(carDetail.error as Error).message}
        </div>
      ) : car && carId ? (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <CarGallery
              images={images}
              activeIndex={activeImageIndex}
              carName={carName}
              fallbackImage={car.primaryImagePath}
              onSelect={setActiveImageIndex}
            />
            <CarInfoPanel car={car} carId={carId} carName={carName} onAddToCart={handleAddToCart} />
          </div>

          <TechSpecSection techSpec={techSpec} />
        </div>
      ) : null}
    </div>
  );
}

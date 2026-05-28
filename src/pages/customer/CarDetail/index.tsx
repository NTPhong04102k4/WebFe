import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Lock, ShoppingCart } from "lucide-react";
import { notify } from "@/components/core/Feedback/toast";

import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import { useCarTechSpec } from "@/query/car/useCarQueries";
import { useMySubscription } from "@/query/premium/usePremiumQueries";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/common/utils/formatCurrency";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PremiumGateModal from "@/pages/customer/Premium/components/PremiumGateModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as string[]; } catch { return [raw]; }
  }
  return [];
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
      value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${value ? "bg-green-500" : "bg-slate-400"}`} />
      {label}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CustomerCarDetailPage() {
  const addItem = useCartStore((s) => s.addItem);

  const [premiumGateOpen, setPremiumGateOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const params = useParams();
  const id = useMemo(() => {
    const n = Number(params.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.id]);

  // Basic car info
  const { data: car, isLoading, error } = useQuery<any>({
    queryKey: ["customer-car-detail", id],
    enabled: !!id,
    queryFn: ({ signal }) => carRouteFn.getDetail(id!, { signal }),
  });

  // Premium subscription
  const subQuery = useMySubscription();
  const isPremium = subQuery.data?.subscription?.status === "Active";

  // Tech spec — only fetch if premium
  const techSpec = useCarTechSpec(id, isPremium);

  const images = parseImages(car?.imagePaths);
  const displayImg = images[activeImg] ?? car?.primaryImagePath ?? null;
  const carName = car?.carName ?? `Xe #${id ?? ""}`;
  const price = car?.salePrice ?? car?.price ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link to="/cars" className="text-sm font-medium text-blue-700 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được thông tin xe. {(error as Error).message}
        </div>
      ) : car ? (
        <div className="space-y-8">
          {/* ── Hero ────────────────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[16/9]">
                {displayImg ? (
                  <img src={displayImg} alt={carName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Không có ảnh
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        i === activeImg ? "border-blue-500" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {car.isFeature && (
                <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Nổi bật
                </span>
              )}
              <h1 className="text-2xl font-bold text-slate-900">{carName}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {car.modelYear} · {car.modelName} · {car.condition}
              </p>

              <div className="mt-4">
                <div className="text-3xl font-extrabold text-blue-700">{formatCurrency(price)}</div>
                {car.importPrice && car.salePrice && car.salePrice < car.importPrice * 1.2 && (
                  <p className="mt-0.5 text-sm text-slate-500 line-through">{formatCurrency(car.importPrice)}</p>
                )}
              </div>

              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => {
                  if (!id) { notify.error("Không tìm thấy mã xe"); return; }
                  addItem({ type: "car", id, name: carName, price, imagePath: displayImg ?? undefined });
                  notify.success("Đã thêm vào giỏ hàng");
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Thêm vào giỏ hàng
              </button>

              {/* Basic specs */}
              <div className="mt-6 divide-y divide-slate-100">
                <Row label="Mã xe" value={car.carCode} />
                <Row label="Màu sắc" value={car.color} />
                <Row label="Nhiên liệu" value={car.fuelType} />
                <Row label="Hộp số" value={car.transmission} />
                <Row label="Dẫn động" value={car.driveType} />
                <Row label="Dung tích" value={car.engineSize ? `${car.engineSize}L` : null} />
                <Row label="Số cửa" value={car.doors} />
                <Row label="Số chỗ" value={car.seats} />
                <Row label="Số km" value={car.mileage != null ? `${car.mileage.toLocaleString("vi-VN")} km` : null} />
              </div>

              {car.shortDescription && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {car.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* ── Tech spec section (premium gated) ───────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Thông số kỹ thuật chi tiết</h2>
              {!isPremium && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Lock className="h-3.5 w-3.5" /> Premium
                </span>
              )}
            </div>

            {!isPremium ? (
              <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Lock className="h-7 w-7" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-800">
                  Thông số kỹ thuật dành riêng cho thành viên Premium
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Nâng cấp để xem kích thước xe, thông số động cơ, hiệu năng, mức tiêu hao nhiên liệu và trang bị an toàn.
                </p>
                <button
                  className="mt-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => setPremiumGateOpen(true)}
                >
                  Đăng ký Premium để xem
                </button>
              </div>
            ) : techSpec.isLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : techSpec.error ? (
              <p className="mt-4 text-sm text-red-600">Không tải được thông số kỹ thuật.</p>
            ) : techSpec.data ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Kích thước */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Kích thước</h3>
                  <div className="divide-y divide-slate-100">
                    <Row label="Dài" value={techSpec.data.length_mm != null ? `${techSpec.data.length_mm} mm` : null} />
                    <Row label="Rộng" value={techSpec.data.width_mm != null ? `${techSpec.data.width_mm} mm` : null} />
                    <Row label="Cao" value={techSpec.data.height_mm != null ? `${techSpec.data.height_mm} mm` : null} />
                    <Row label="Chiều dài cơ sở" value={techSpec.data.wheelbase_mm != null ? `${techSpec.data.wheelbase_mm} mm` : null} />
                    <Row label="Khoảng sáng gầm" value={techSpec.data.groundClearance_mm != null ? `${techSpec.data.groundClearance_mm} mm` : null} />
                    <Row label="Khối lượng" value={techSpec.data.curbWeight_kg != null ? `${techSpec.data.curbWeight_kg} kg` : null} />
                  </div>
                </div>

                {/* Động cơ & hiệu năng */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Động cơ & Hiệu năng</h3>
                  <div className="divide-y divide-slate-100">
                    <Row label="Mã động cơ" value={techSpec.data.engineCode} />
                    <Row label="Số xy lanh" value={techSpec.data.cylinders} />
                    <Row label="Công suất tối đa" value={techSpec.data.maxPower_hp != null ? `${techSpec.data.maxPower_hp} HP` : null} />
                    <Row label="Mô-men xoắn" value={techSpec.data.maxTorque_nm != null ? `${techSpec.data.maxTorque_nm} Nm` : null} />
                    <Row label="Tốc độ tối đa" value={techSpec.data.topSpeed_kmh != null ? `${techSpec.data.topSpeed_kmh} km/h` : null} />
                    <Row label="Dung tích bình xăng" value={techSpec.data.fuelTankCapacity_l != null ? `${techSpec.data.fuelTankCapacity_l} L` : null} />
                  </div>
                </div>

                {/* An toàn & Tiện nghi */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">An toàn & Tiện nghi</h3>
                  <div className="mb-3 divide-y divide-slate-100">
                    <Row label="Xếp hạng an toàn" value={techSpec.data.safetyRating} />
                    <Row label="Túi khí" value={techSpec.data.airbags != null ? `${techSpec.data.airbags} túi` : null} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <BoolBadge label="ABS" value={techSpec.data.abs} />
                    <BoolBadge label="ESP" value={techSpec.data.esp} />
                    <BoolBadge label="Điều hòa" value={techSpec.data.airConditioning} />
                    <BoolBadge label="Cửa sổ trời" value={techSpec.data.sunRoof} />
                    <BoolBadge label="Ghế da" value={techSpec.data.leatherSeats} />
                    <BoolBadge label="GPS" value={techSpec.data.navigationSystem} />
                    <BoolBadge label="Bluetooth" value={techSpec.data.bluetoothConnectivity} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {premiumGateOpen && (
        <PremiumGateModal
          featureTitle="Thông số kỹ thuật chi tiết"
          featureDescription="Xem toàn bộ thông số kỹ thuật, an toàn và tiện nghi của xe"
          onClose={() => setPremiumGateOpen(false)}
        />
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import type {
  AiIntent,
  AiMetadata,
  BookingPromptMetadata,
} from "@/services/api/functions/ai/ai.api";

interface Props {
  intent: AiIntent;
  metadata: AiMetadata | null;
  onBookingOpen?: (services: BookingPromptMetadata["services"]) => void;
}

export function MetadataRenderer({ metadata, onBookingOpen }: Props) {
  const navigate = useNavigate();

  if (!metadata) return null;

  switch (metadata.type) {
    case "car_list":
      return (
        <div className="mt-3 space-y-2">
          {metadata.items.map((car) => (
            <button
              key={car.carId}
              type="button"
              onClick={() => navigate(`/cars/${car.carId}`)}
              className="flex w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              {car.image && (
                <img
                  src={car.image}
                  alt={car.carName}
                  className="h-24 w-28 shrink-0 object-cover"
                />
              )}
              <div className="min-w-0 flex-1 p-3">
                <div className="truncate text-sm font-semibold text-slate-900">{car.carName}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {car.brand} - {car.modelYear}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  {car.salePrice ? (
                    <>
                      <span className="text-sm font-semibold text-red-600">{formatVND(car.salePrice)}</span>
                      <span className="text-xs text-slate-400 line-through">{formatVND(car.listPrice)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">{formatVND(car.listPrice)}</span>
                  )}
                </div>
                <div className="mt-1 truncate text-xs text-slate-500">
                  {car.fuelType}
                  {car.seats ? ` - ${car.seats} cho` : ""}
                  {car.location ? ` - ${car.location}` : ""}
                </div>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate("/cars")}
            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            Xem tat ca xe
          </button>
        </div>
      );

    case "service_list":
      return (
        <div className="mt-3 space-y-2">
          {metadata.items.map((svc) => (
            <div key={svc.serviceId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-900">{svc.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">{svc.category}</div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="font-semibold text-blue-700">{formatVND(svc.price)}</span>
                <span className="text-slate-500">{svc.duration} phut</span>
              </div>
              {svc.description && (
                <div className="mt-2 line-clamp-2 text-xs text-slate-500">{svc.description}</div>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onBookingOpen?.(
                  metadata.items.map((svc) => ({
                    serviceId: svc.serviceId,
                    name: svc.name,
                    price: svc.price,
                    duration: svc.duration,
                  }))
                )
              }
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Dat lich ngay
            </button>
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xem tat ca dich vu
            </button>
          </div>
        </div>
      );

    case "accessory_list":
      return (
        <div className="mt-3 space-y-2">
          {metadata.items.map((acc) => (
            <button
              key={acc.accessoryId}
              type="button"
              onClick={() => navigate(`/accessories/${acc.accessoryId}`)}
              className="flex w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              {acc.image && (
                <img src={acc.image} alt={acc.name} className="h-20 w-24 shrink-0 object-cover" />
              )}
              <div className="min-w-0 flex-1 p-3">
                <div className="truncate text-sm font-semibold text-slate-900">{acc.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{acc.brand ?? acc.category}</div>
                <div className="mt-2 text-sm font-semibold text-blue-700">{formatVND(acc.price)}</div>
                <div className={acc.stock < 5 ? "mt-1 text-xs text-red-500" : "mt-1 text-xs text-slate-500"}>
                  Con {acc.stock} san pham
                  {acc.warranty ? ` - BH ${acc.warranty} thang` : ""}
                </div>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate("/accessories")}
            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            Xem tat ca phu kien
          </button>
        </div>
      );

    case "booking_prompt":
      return (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
          <div className="text-xs font-semibold text-slate-700">Dich vu co the dat lich:</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {metadata.services.slice(0, 4).map((service) => (
              <button
                key={service.serviceId}
                type="button"
                onClick={() => onBookingOpen?.([service])}
                className="rounded-full bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-blue-100 hover:text-blue-700"
              >
                {service.name} - {formatVND(service.price)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onBookingOpen?.(metadata.services)}
            className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Mo form dat lich
          </button>
        </div>
      );

    default:
      return null;
  }
}

function formatVND(value: number) {
  return `${value.toLocaleString("vi-VN")}d`;
}

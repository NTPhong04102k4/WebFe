import { Link } from "react-router-dom";
import { Modal } from "@/components/core/Modal/Modal";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { CarResponseItem } from "@/shared/types/Reponse/Car";
import { getImageSrc } from "../carHelpers";

const COMPARE_ROWS: { label: string; key: keyof CarResponseItem }[] = [
  { label: "Giá bán", key: "salePrice" },
  { label: "Năm SX", key: "modelYear" },
  { label: "Tình trạng", key: "condition" },
  { label: "Động cơ (cc)", key: "engineSize" },
  { label: "Nhiên liệu", key: "fuelType" },
  { label: "Hộp số", key: "transmission" },
  { label: "Dẫn động", key: "driveType" },
  { label: "Số chỗ", key: "seats" },
  { label: "Số cửa", key: "doors" },
  { label: "Màu sắc", key: "color" },
  { label: "Số km", key: "mileage" },
];

interface CompareModalProps {
  cars: CarResponseItem[];
  onClose: () => void;
}

export function CompareModal({ cars, onClose }: CompareModalProps) {
  const footer = (
    <div className="flex justify-center gap-3">
      {cars.map((car) => (
        <Link
          key={car.carID}
          to={`/cars/${car.carID}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Xem {car.carName}
        </Link>
      ))}
    </div>
  );

  return (
    <Modal open title="So sánh xe" onClose={onClose} size="xl" footer={footer}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="">
              <th className="sticky left-0 w-36 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                {" "}
              </th>
              {cars.map((car) => {
                const img = getImageSrc(car);
                return (
                  <th
                    key={car.carID}
                    className="w-[250px] flex-col px-4 py-3 text-left"
                  >
                    {img ? (
                      <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={img}
                          alt={car.carName}
                          className="h-full w-full object-fill"
                        />
                      </div>
                    ) : (
                      <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-300"></div>
                    )}
                    <div className="font-semibold text-slate-900 line-clamp-2">
                      {car.carName}
                    </div>
                    <div className="mt-1 text-lg font-bold text-blue-700">
                      {formatCurrency(car.salePrice ?? car.price)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map(({ label, key }, i) => (
              <tr
                key={key}
                className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="sticky left-0 bg-inherit px-4 py-2.5 text-xs font-medium text-slate-500">
                  {label}
                </td>
                {cars.map((car) => {
                  const val = car[key];
                  const display =
                    key === "salePrice"
                      ? formatCurrency(Number(val))
                      : key === "mileage"
                        ? Number(val).toLocaleString("vi-VN") + " km"
                        : String(val ?? "—");
                  return (
                    <td
                      key={car.carID}
                      className="px-4 py-2.5 font-medium text-slate-800"
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

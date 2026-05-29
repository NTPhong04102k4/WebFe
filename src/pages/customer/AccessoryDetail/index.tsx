import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { notify } from "@/components/core/Feedback/toast";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { useAccessoryDetail } from "@/query/accessory/useAccessoryQueries";
import { useCartStore } from "@/stores/cartStore";

function parseCompatibleModels(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter((model) => typeof model === "string" && model.trim() !== "");
  }

  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((model): model is string => typeof model === "string" && model.trim() !== "")
      : [raw];
  } catch {
    return raw
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);
  }
}

export default function CustomerAccessoryDetailPage() {
  const addItem = useCartStore((state) => state.addItem);
  const params = useParams();
  const id = useMemo(() => {
    const value = Number(params.id);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [params.id]);

  const { data, isLoading, error } = useAccessoryDetail(id);
  const compatibleModels = parseCompatibleModels(data?.compatibleCarModels);
  const isInStock = (data?.stockQuantity ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/accessories" className="text-sm font-medium text-blue-700 hover:underline">
        Quay lại phụ kiện
      </Link>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : data ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="aspect-[4/3] bg-slate-100">
                {data.imagePath ? (
                  <img className="h-full w-full object-cover" src={data.imagePath} alt={data.accessoryName} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Không có ảnh</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-bold text-slate-900">{data.accessoryName}</h1>
              <p className="mt-2 text-sm text-slate-600">{data.description}</p>
              <div className="mt-5 text-2xl font-bold text-blue-700">{formatCurrency(data.price)}</div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">Tình trạng</div>
                  <div className={isInStock ? "font-semibold text-green-700" : "font-semibold text-red-600"}>
                    {isInStock ? "Còn hàng" : "Hết hàng"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">Bảo hành</div>
                  <div className="font-semibold text-slate-900">{data.warrantyMonths ?? 0} tháng</div>
                </div>
              </div>

              {compatibleModels.length > 0 ? (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-slate-900">Thiết bị tương thích</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {compatibleModels.map((model) => (
                      <span
                        key={model}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase text-blue-700"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={!isInStock}
                className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={() => {
                  addItem({
                    type: "accessory",
                    id: data.accessoryID,
                    name: data.accessoryName,
                    price: data.price,
                    imagePath: data.imagePath,
                  });
                  notify.success("Đã thêm vào giỏ hàng");
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>

          {data.installationVideo ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Video lắp đặt</h2>
              <video className="mt-4 aspect-video w-full rounded-lg bg-black" src={data.installationVideo} controls />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

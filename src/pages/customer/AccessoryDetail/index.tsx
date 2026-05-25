import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { notify } from "@/components/core/Feedback/toast";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { useAccessoryDetail } from "@/query/accessory/useAccessoryQueries";
import { useCartStore } from "@/stores/cartStore";

export default function CustomerAccessoryDetailPage() {
  const addItem = useCartStore((state) => state.addItem);
  const params = useParams();
  const id = useMemo(() => {
    const value = Number(params.id);
    return Number.isFinite(value) ? value : null;
  }, [params.id]);

  const { data, isLoading, error } = useAccessoryDetail(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/accessories" className="text-sm font-medium text-blue-700 hover:underline">
        ← Quay lại phụ kiện
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
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-100">
              {data.imagePath ? (
                <img className="h-full w-full object-cover" src={data.imagePath} alt={data.accessoryName} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-slate-900">{data.accessoryName}</h1>
            <p className="mt-2 text-sm text-slate-600">{data.description}</p>
            <div className="mt-5 text-2xl font-bold text-blue-700">{formatCurrency(data.price)}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-slate-500">Tồn kho</div>
                <div className="font-semibold text-slate-900">{data.stockQuantity}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-slate-500">Bảo hành</div>
                <div className="font-semibold text-slate-900">{data.warrantyMonths ?? 0} tháng</div>
              </div>
            </div>
            <button
              type="button"
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
      ) : null}
    </div>
  );
}

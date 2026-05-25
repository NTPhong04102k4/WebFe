import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notify } from "@/components/core/Feedback/toast";

import { useAccessoryList } from "@/query/accessory/useAccessoryQueries";
import { useCategoryList } from "@/query/category/useCategoryQueries";
import { useBrandAccessoryList } from "@/query/brand-accessory/useBrandAccessoryQueries";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { SelectField } from "@/shared/components/Form/SelectField";

export default function CustomerAccessoriesPage() {
  const addItem = useCartStore((state) => state.addItem);
  const [page, setPage] = useState(1);
  const [categoryID, setCategoryID] = useState("");
  const [brandAccessoryID, setBrandAccessoryID] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const pageSize = 12;

  const priceFromNum = priceFrom ? Number(priceFrom) : undefined;
  const priceToNum = priceTo ? Number(priceTo) : undefined;

  const { data, isLoading, error } = useAccessoryList({
    page,
    pageSize,
    categoryID: categoryID ? Number(categoryID) : undefined,
    brandAccessoryID: brandAccessoryID ? Number(brandAccessoryID) : undefined,
    priceFrom: Number.isFinite(priceFromNum) ? priceFromNum : undefined,
    priceTo: Number.isFinite(priceToNum) ? priceToNum : undefined,
  });
  const { data: categories = [] } = useCategoryList();
  const { data: brands = [] } = useBrandAccessoryList();

  const categoryOptions = useMemo(
    () =>
      categories.map((item: any) => ({
        value: String(item.categoryID ?? item.id),
        label: item.categoryName ?? item.name,
      })),
    [categories]
  );
  const brandOptions = useMemo(
    () =>
      brands.map((item: any) => ({
        value: String(item.brandAccessoryID ?? item.id),
        label: item.brandName ?? item.brandAccessoryName ?? item.name,
      })),
    [brands]
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phụ kiện xe</h1>
          <p className="mt-1 text-sm text-slate-600">Mua phụ kiện, phụ tùng và thêm vào giỏ hàng.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <SelectField
          label="Danh mục"
          value={categoryID}
          options={categoryOptions}
          onChange={(event) => {
            setPage(1);
            setCategoryID(event.target.value);
          }}
        />
        <SelectField
          label="Thương hiệu"
          value={brandAccessoryID}
          options={brandOptions}
          onChange={(event) => {
            setPage(1);
            setBrandAccessoryID(event.target.value);
          }}
        />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Giá từ</span>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            inputMode="numeric"
            value={priceFrom}
            onChange={(event) => {
              setPage(1);
              setPriceFrom(event.target.value);
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Giá đến</span>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            inputMode="numeric"
            value={priceTo}
            onChange={(event) => {
              setPage(1);
              setPriceTo(event.target.value);
            }}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-600">Đang tải...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.accessoryID} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-100">
                  {item.imagePath ? (
                    <img className="h-full w-full object-cover" src={item.imagePath} alt={item.accessoryName} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{item.accessoryName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.categoryName} · {item.brandName}</p>
                  <p className="mt-1 text-xs text-slate-500">Tồn kho: {item.stockQuantity}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-lg font-bold text-blue-700">{formatCurrency(item.price)}</div>
                    <div className="flex items-center gap-2">
                      <Link className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50" to={`/accessories/${item.accessoryID}`}>
                        Chi tiết
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        disabled={item.stockQuantity <= 0}
                        onClick={() => {
                          addItem({
                            type: "accessory",
                            id: item.accessoryID,
                            name: item.accessoryName,
                            price: item.price,
                            imagePath: item.imagePath,
                          });
                          notify.success("Đã thêm vào giỏ hàng");
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              Trước
            </button>
            <span className="text-sm text-slate-600">Trang {page} / {totalPages}</span>
            <button className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}

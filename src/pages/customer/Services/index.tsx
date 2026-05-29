import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import { useServiceCategoryList } from "src/query/service-category/useServiceCategoryQueries";

export default function CustomerServicesPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [categoryID, setCategoryID] = useState<number | "">("");
  const [search, setSearch] = useState({ keyword: "", categoryID: "" });

  const { data, isLoading } = useServiceCatalog({
    page: 1,
    pageSize: 50,
    isActive: true,
    keyword: search.keyword || undefined,
    categoryID: search.categoryID ? Number(search.categoryID) : undefined,
  });

  const categories = useServiceCategoryList();
  const categoryList = (categories.data as Array<{ categoryID?: number; id?: number; categoryName?: string; name?: string }> | undefined) ?? [];

  const services = data?.data ?? [];

  const handleSearch = () => {
    setSearch({ keyword, categoryID: String(categoryID) });
  };

  const handleBookService = (serviceID: number) => {
    navigate(`/appointments?serviceID=${serviceID}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dịch vụ sửa chữa & bảo dưỡng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn dịch vụ phù hợp và đặt lịch hẹn trực tuyến.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          placeholder="Tìm dịch vụ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-[180px] rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <select
          value={categoryID}
          onChange={(e) => setCategoryID(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        >
          <option value="">Tất cả danh mục</option>
          {categoryList.map((c) => {
            const id = c.categoryID ?? c.id;
            const name = c.categoryName ?? c.name;
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Service grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Đang tải dịch vụ...</div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-slate-500">Không tìm thấy dịch vụ phù hợp.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.serviceID}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {svc.categoryName ?? "—"}
                  </span>
                  <h3 className="mt-2 font-semibold text-slate-900 leading-snug">{svc.serviceName}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{svc.serviceCode}</p>
                </div>
              </div>

              {svc.description && (
                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{svc.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>⏱ {svc.estimatedDuration_minutes} phút</span>
                {svc.requiredSkills && svc.requiredSkills.length > 0 && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                    {svc.requiredSkills.join(", ")}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold text-blue-700">
                  {formatCurrency(svc.price)}
                </span>
                <button
                  type="button"
                  onClick={() => handleBookService(svc.serviceID)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Đặt lịch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

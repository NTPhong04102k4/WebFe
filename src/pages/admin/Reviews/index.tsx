import { useState } from "react";
import { Star } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import {
  useAllCarReviews,
  useServiceReviews,
  useReviewMutations,
} from "src/query/review/useReviewQueries";
import { DateTimePicker } from "src/components/common/DateTimePicker";
import type { DateTimeRangeValue } from "src/components/common/DateTimePicker";

const PAGE_SIZE = 20;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-600"}`} />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<"car" | "service">("car");
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>({ fromDate: "", toDate: "" });
  const [deletingCarId, setDeletingCarId] = useState<number | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  const fromDate = dateRange.fromDate ? dateRange.fromDate.slice(0, 10) : undefined;
  const toDate = dateRange.toDate ? dateRange.toDate.slice(0, 10) : undefined;

  const carQ = useAllCarReviews({ page, pageSize: PAGE_SIZE, fromDate, toDate });
  const serviceQ = useServiceReviews({ page, pageSize: PAGE_SIZE, locationId: 0, fromDate, toDate });
  const { deleteCarReview, deleteServiceReview } = useReviewMutations();

  const carReviews = carQ.data?.data ?? [];
  const serviceReviews = serviceQ.data?.data ?? [];
  const carTotal = carQ.data?.totalCount ?? 0;
  const carPages = Math.max(1, Math.ceil(carTotal / PAGE_SIZE));

  const filter = <T extends { overallRating: number }>(list: T[]) => {
    return list.filter((r) => starFilter == null || r.overallRating === starFilter);
  };

  const avgRating = carReviews.length
    ? (carReviews.reduce((s, r) => s + r.overallRating, 0) / carReviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-amber-400" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đánh giá</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Đánh giá xe</p>
          <p className="text-2xl font-bold text-blue-600">{carTotal}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Đánh giá dịch vụ</p>
          <p className="text-2xl font-bold text-purple-600">{serviceQ.data?.totalCount ?? serviceReviews.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Điểm TB xe</p>
          <p className="text-2xl font-bold text-amber-500">{avgRating}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit dark:border-slate-700 dark:bg-slate-800">
        {(["car", "service"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t === "car" ? "Đánh giá xe" : "Đánh giá dịch vụ"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Sao:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => { setStarFilter(starFilter === s ? null : s); setPage(1); }}
                className={`rounded px-2 py-1 text-xs ${starFilter === s ? "bg-amber-100 text-amber-700 font-medium" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <DateTimePicker
            label="Khoảng ngày"
            type="date"
            value={dateRange}
            onChange={(v) => { setDateRange(v); setPage(1); }}
            className="flex-1 min-w-[280px]"
          />
          {(dateRange.fromDate || dateRange.toDate) && (
            <button
              onClick={() => { setDateRange({ fromDate: "", toDate: "" }); setPage(1); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400"
            >
              Xóa lọc ngày
            </button>
          )}
        </div>
      </div>

      {/* Car Reviews Table */}
      {tab === "car" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Tiêu đề / Nội dung</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {carQ.isLoading && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Đang tải...</td></tr>
              )}
              {!carQ.isLoading && filter(carReviews).length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Không có đánh giá nào.</td></tr>
              )}
              {filter(carReviews).map((review, i) => (
                <tr key={review.reviewID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3"><StarRating rating={review.overallRating} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    {review.title && <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{review.title}</p>}
                    <p className="text-slate-400 line-clamp-2 text-xs">{review.content.slice(0, 100)}{review.content.length > 100 ? "…" : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(review.createdDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setDeletingCarId(review.reviewID);
                        deleteCarReview.mutate(review.reviewID, {
                          onSuccess: () => { notify.success("Đã xóa đánh giá"); setDeletingCarId(null); },
                          onError: () => { setDeletingCarId(null); },
                        });
                      }}
                      disabled={deletingCarId === review.reviewID}
                      className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-400"
                    >
                      {deletingCarId === review.reviewID ? "…" : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service Reviews Table */}
      {tab === "service" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {serviceQ.isLoading && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Đang tải...</td></tr>
              )}
              {!serviceQ.isLoading && filter(serviceReviews).length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Không có đánh giá dịch vụ nào.</td></tr>
              )}
              {filter(serviceReviews).map((review, i) => (
                <tr key={review.reviewID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3"><StarRating rating={review.overallRating} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-400 line-clamp-2 text-xs">{review.content.slice(0, 100)}{review.content.length > 100 ? "…" : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(review.createdDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setDeletingServiceId(review.reviewID);
                        deleteServiceReview.mutate(review.reviewID, {
                          onSuccess: () => { notify.success("Đã xóa đánh giá dịch vụ"); setDeletingServiceId(null); },
                          onError: () => { setDeletingServiceId(null); },
                        });
                      }}
                      disabled={deletingServiceId === review.reviewID}
                      className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-400"
                    >
                      {deletingServiceId === review.reviewID ? "…" : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {tab === "car" && carPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Tổng {carTotal} · Trang {page}/{carPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">
              Trước
            </button>
            <button disabled={page >= carPages} onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Star, Search, MessageSquare } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import {
  usePendingReviews,
  useServiceReviews,
  useReviewMutations,
} from "src/query/review/useReviewQueries";
import type { CarReviewViewModel, ServiceReviewViewModel } from "src/services/api/functions/review/review.types";
import { ModerateModal } from "./ModerateModal";
import { ServiceReplyModal } from "./ServiceReplyModal";

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

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<"car" | "service">("car");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const [moderateAction, setModerateAction] = useState<"Approve" | "Reject" | null>(null);
  const [moderatingReview, setModerating] = useState<CarReviewViewModel | null>(null);
  const [replyingReview, setReplyingReview] = useState<ServiceReviewViewModel | null>(null);

  const pendingQ = usePendingReviews({ page, pageSize: PAGE_SIZE });
  const serviceQ = useServiceReviews({ page, pageSize: PAGE_SIZE, locationId: 0 });
  const { moderateReview, respondToServiceReview } = useReviewMutations();

  const carReviews = pendingQ.data?.data ?? [];
  const serviceReviews = serviceQ.data?.data ?? [];
  const carTotal = pendingQ.data?.totalCount ?? 0;
  const carPages = Math.max(1, Math.ceil(carTotal / PAGE_SIZE));

  const filteredCarReviews = carReviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.reviewerName?.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    const matchStar = starFilter == null || r.overallRating === starFilter;
    return matchSearch && matchStar;
  });

  const filteredServiceReviews = serviceReviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.reviewerName?.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    const matchStar = starFilter == null || r.overallRating === starFilter;
    return matchSearch && matchStar;
  });

  const avgRating = carReviews.length
    ? (carReviews.reduce((s, r) => s + r.overallRating, 0) / carReviews.length).toFixed(1)
    : "—";

  const handleModerate = (action: "Approve" | "Reject", reason?: string) => {
    if (!moderatingReview) return;
    moderateReview.mutate(
      { id: moderatingReview.reviewID, body: { action, reason } },
      {
        onSuccess: () => {
          notify.success(action === "Approve" ? "Đã duyệt đánh giá" : "Đã từ chối đánh giá");
          setModerating(null);
          setModerateAction(null);
        },
        onError: () => notify.error("Có lỗi khi xử lý đánh giá"),
      }
    );
  };

  const handleReply = (response: string) => {
    if (!replyingReview) return;
    respondToServiceReview.mutate(
      { id: replyingReview.reviewID, response },
      {
        onSuccess: () => {
          notify.success("Đã gửi phản hồi");
          setReplyingReview(null);
        },
        onError: () => notify.error("Có lỗi khi gửi phản hồi"),
      }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-amber-400" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đánh giá</h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Chờ duyệt</p>
          <p className={`text-2xl font-bold ${carTotal > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-200"}`}>
            {carTotal}
            {carTotal > 0 && (
              <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            )}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Đánh giá xe</p>
          <p className="text-2xl font-bold text-blue-600">{carReviews.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Đánh giá dịch vụ</p>
          <p className="text-2xl font-bold text-purple-600">{serviceReviews.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400">Điểm TB</p>
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
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo người dùng hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Sao:</span>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(starFilter === s ? null : s)}
              className={`rounded px-2 py-1 text-xs ${starFilter === s ? "bg-amber-100 text-amber-700 font-medium" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            >
              {s}★
            </button>
          ))}
        </div>
      </div>

      {/* Car Reviews Table */}
      {tab === "car" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Tiêu đề / Nội dung</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingQ.isLoading && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Đang tải...</td></tr>
              )}
              {!pendingQ.isLoading && filteredCarReviews.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Không có đánh giá nào.</td></tr>
              )}
              {filteredCarReviews.map((review, i) => (
                <tr key={review.reviewID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{review.reviewerName ?? "—"}</td>
                  <td className="px-4 py-3"><StarRating rating={review.overallRating} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    {review.title && <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{review.title}</p>}
                    <p className="text-slate-400 line-clamp-2 text-xs">{review.content.slice(0, 80)}{review.content.length > 80 ? "…" : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[review.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(review.createdDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setModerating(review); setModerateAction("Approve"); }}
                        disabled={review.status !== "Pending"}
                        className="rounded border border-green-400 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-green-600 dark:text-green-400"
                      >
                        ✓ Duyệt
                      </button>
                      <button
                        onClick={() => { setModerating(review); setModerateAction("Reject"); }}
                        disabled={review.status !== "Pending"}
                        className="rounded border border-red-400 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-600 dark:text-red-400"
                      >
                        ✗ Từ chối
                      </button>
                    </div>
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
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Phản hồi</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {serviceQ.isLoading && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Đang tải...</td></tr>
              )}
              {!serviceQ.isLoading && filteredServiceReviews.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Không có đánh giá dịch vụ nào.</td></tr>
              )}
              {filteredServiceReviews.map((review, i) => (
                <tr key={review.reviewID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{review.reviewerName ?? "—"}</td>
                  <td className="px-4 py-3"><StarRating rating={review.overallRating} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-xs">{review.content.slice(0, 80)}{review.content.length > 80 ? "…" : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {review.shopResponse ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><MessageSquare className="h-3 w-3" /> Đã phản hồi</span>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa phản hồi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(review.createdDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    {!review.shopResponse && (
                      <button
                        onClick={() => setReplyingReview(review)}
                        className="rounded border border-blue-400 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
                      >
                        Phản hồi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination for car reviews */}
      {tab === "car" && carPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Tổng {carTotal} · Trang {page}/{carPages}
          </span>
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

      <ModerateModal
        open={moderatingReview != null}
        action={moderateAction}
        review={moderatingReview}
        isPending={moderateReview.isPending}
        onClose={() => { setModerating(null); setModerateAction(null); }}
        onConfirm={handleModerate}
      />

      <ServiceReplyModal
        open={replyingReview != null}
        review={replyingReview}
        isPending={respondToServiceReview.isPending}
        onClose={() => setReplyingReview(null)}
        onConfirm={handleReply}
      />
    </div>
  );
}

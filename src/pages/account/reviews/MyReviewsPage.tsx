import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import {
  useMyCarReviews,
  useMyServiceReviews,
  useReviewMutations,
} from "src/query/review/useReviewQueries";
import { notify } from "@/components/core/Feedback/toast";
import LoadingSpinner from "src/components/common/LoadingSpinner";
import EmptyState from "src/components/common/EmptyState";

import shell from "../account-shell.module.scss";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

export default function MyReviewsPage() {
  const [tab, setTab] = useState<"car" | "service">("car");
  const [carPage, setCarPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  const carQ = useMyCarReviews(carPage);
  const serviceQ = useMyServiceReviews(servicePage);
  const { deleteCarReview, deleteServiceReview } = useReviewMutations();

  const carReviews = carQ.data?.data ?? [];
  const serviceReviews = serviceQ.data?.data ?? [];
  const carTotal = carQ.data?.totalCount ?? 0;
  const serviceTotal = serviceQ.data?.totalCount ?? 0;

  return (
    <section>
      <h2 className={shell.title}>Đánh giá của tôi</h2>
      <p className={shell.sub}>Xem lại và xóa các đánh giá bạn đã viết.</p>

      <div className={shell.nav} style={{ border: "none", paddingBottom: 0, gap: "0.5rem" }}>
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={tab === "car" ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" } : undefined}
          onClick={() => setTab("car")}
        >
          Xe ({carTotal})
        </button>
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={tab === "service" ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" } : undefined}
          onClick={() => setTab("service")}
        >
          Dịch vụ ({serviceTotal})
        </button>
      </div>

      {/* Car Reviews */}
      {tab === "car" && (
        <div className="mt-4 space-y-3">
          {carQ.isLoading && <LoadingSpinner size="sm" />}
          {!carQ.isLoading && carReviews.length === 0 && (
            <EmptyState
              title="Bạn chưa có đánh giá xe nào."
              action={
                <Link to="/cars" className={`${shell.btn} ${shell.primary}`} style={{ display: "inline-block" }}>
                  Khám phá xe
                </Link>
              }
            />
          )}
          {carReviews.map((r) => (
            <div key={r.reviewID} className={shell.card}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRow rating={r.overallRating} />
                    <span className="text-xs text-slate-400">{new Date(r.createdDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                  {r.carName && (
                    <Link to={`/cars/${r.carID}`} className="mt-1 block text-sm font-semibold text-blue-700 hover:underline truncate">
                      {r.carName}
                    </Link>
                  )}
                  {r.title && <p className="mt-1 text-sm font-medium text-slate-700">{r.title}</p>}
                  <p className="mt-1 text-sm text-slate-500 line-clamp-3">{r.content}</p>
                  {(r.pros || r.cons) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {r.pros && <span className="rounded bg-green-50 px-2 py-0.5 text-green-700">+ {r.pros}</span>}
                      {r.cons && <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">− {r.cons}</span>}
                    </div>
                  )}
                </div>
                <button
                  className={`${shell.btn} flex-shrink-0`}
                  style={{ border: "1px solid #fca5a5", color: "#dc2626", background: "transparent", padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                  disabled={deleteCarReview.isPending}
                  onClick={() => {
                    if (!window.confirm("Xóa đánh giá này?")) return;
                    deleteCarReview.mutate(r.reviewID, {
                      onSuccess: () => notify.success("Đã xóa đánh giá"),
                    });
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {carTotal > 20 && (
            <div className="flex items-center justify-between text-sm pt-2">
              <span className={shell.sub}>Tổng {carTotal}</span>
              <div className="flex gap-2">
                <button className={`${shell.btn} ${shell.secondary}`} disabled={carPage <= 1} onClick={() => setCarPage((p) => p - 1)}>Trước</button>
                <button className={`${shell.btn} ${shell.secondary}`} disabled={carReviews.length < 20} onClick={() => setCarPage((p) => p + 1)}>Sau</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Service Reviews */}
      {tab === "service" && (
        <div className="mt-4 space-y-3">
          {serviceQ.isLoading && <LoadingSpinner size="sm" />}
          {!serviceQ.isLoading && serviceReviews.length === 0 && (
            <EmptyState title="Bạn chưa có đánh giá dịch vụ nào." />
          )}
          {serviceReviews.map((r) => (
            <div key={r.reviewID} className={shell.card}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRow rating={r.overallRating} />
                    <span className="text-xs text-slate-400">{new Date(r.createdDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                  {r.technicianName && (
                    <p className="mt-1 text-sm font-semibold text-slate-700">KTV: {r.technicianName}</p>
                  )}
                  {r.title && <p className="mt-1 text-sm font-medium text-slate-600">{r.title}</p>}
                  <p className="mt-1 text-sm text-slate-500 line-clamp-3">{r.content}</p>
                  {r.responseFromShop && (
                    <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      <span className="font-medium">Phản hồi:</span> {r.responseFromShop}
                    </div>
                  )}
                </div>
                <button
                  className={`${shell.btn} flex-shrink-0`}
                  style={{ border: "1px solid #fca5a5", color: "#dc2626", background: "transparent", padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                  disabled={deleteServiceReview.isPending}
                  onClick={() => {
                    if (!window.confirm("Xóa đánh giá này?")) return;
                    deleteServiceReview.mutate(r.reviewID, {
                      onSuccess: () => notify.success("Đã xóa đánh giá dịch vụ"),
                    });
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {serviceTotal > 20 && (
            <div className="flex items-center justify-between text-sm pt-2">
              <span className={shell.sub}>Tổng {serviceTotal}</span>
              <div className="flex gap-2">
                <button className={`${shell.btn} ${shell.secondary}`} disabled={servicePage <= 1} onClick={() => setServicePage((p) => p - 1)}>Trước</button>
                <button className={`${shell.btn} ${shell.secondary}`} disabled={serviceReviews.length < 20} onClick={() => setServicePage((p) => p + 1)}>Sau</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

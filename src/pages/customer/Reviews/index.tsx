import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";

import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import { useCarReviews, useCarReviewStats, useReviewMutations } from "@/query/review/useReviewQueries";

export default function CustomerReviewsPage() {
  const [carID, setCarID] = useState("");
  const [overallRating, setOverallRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const { createCarReview } = useReviewMutations();

  const cars = useQuery({
    queryKey: ["review-cars"],
    queryFn: ({ signal }) => carRouteFn.getPaging({ pageIndex: 1, pageSize: 100 }, { signal }),
  });
  const selectedCarId = useMemo(() => {
    const value = Number(carID);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [carID]);
  const reviews = useCarReviews({ carId: selectedCarId ?? 0, page: 1, pageSize: 20, status: "Approved" });
  const stats = useCarReviewStats(selectedCarId);

  const submit = () => {
    if (!selectedCarId || !content.trim()) {
      notify.info("Vui lòng chọn xe và nhập nội dung đánh giá");
      return;
    }
    createCarReview.mutate(
      {
        carID: selectedCarId,
        overallRating,
        title: title.trim() || null,
        content: content.trim(),
        pros: pros.trim() || null,
        cons: cons.trim() || null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setPros("");
          setCons("");
          notify.success("Đã gửi đánh giá, vui lòng chờ duyệt");
        },
        onError: (error: Error) => notify.error(error.message),
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Review xe và dịch vụ</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Viết review xe</h2>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Xe</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={carID} onChange={(event) => setCarID(event.target.value)}>
              <option value="">Chọn xe</option>
              {(cars.data?.data ?? []).map((car) => (
                <option key={car.carID} value={car.carID}>{car.carName}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Điểm tổng thể</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={overallRating} onChange={(event) => setOverallRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Tiêu đề</span>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Nội dung</span>
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={4} value={content} onChange={(event) => setContent(event.target.value)} />
          </label>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <textarea className="rounded-lg border px-3 py-2 text-sm" rows={3} placeholder="Ưu điểm" value={pros} onChange={(event) => setPros(event.target.value)} />
            <textarea className="rounded-lg border px-3 py-2 text-sm" rows={3} placeholder="Nhược điểm" value={cons} onChange={(event) => setCons(event.target.value)} />
          </div>
          <button className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={createCarReview.isPending} onClick={submit}>
            {createCarReview.isPending ? "Đang gửi..." : "Gửi review"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">Review đã duyệt</h2>
            {stats.data ? (
              <p className="mt-1 text-sm text-slate-600">
                Trung bình {stats.data.averageRating}/5 từ {stats.data.reviewCount} đánh giá
              </p>
            ) : null}
          </div>
          <div className="divide-y">
            {!selectedCarId ? (
              <div className="p-6 text-center text-slate-600">Chọn xe để xem review.</div>
            ) : reviews.isLoading ? (
              <div className="p-6 text-center text-slate-600">Đang tải...</div>
            ) : (reviews.data?.data ?? []).length === 0 ? (
              <div className="p-6 text-center text-slate-600">Chưa có review đã duyệt.</div>
            ) : (
              (reviews.data?.data ?? []).map((review) => (
                <div key={review.reviewID} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{review.title ?? review.carName}</div>
                      <div className="mt-1 text-sm text-slate-500">{review.reviewerName ?? "Khách hàng"} · {review.overallRating}/5 sao</div>
                    </div>
                    <div className="text-xs text-slate-500">{new Date(review.createdDate).toLocaleDateString("vi-VN")}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{review.content}</p>
                  {(review.pros || review.cons) ? (
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {review.pros ? <div className="rounded-lg bg-green-50 p-3 text-green-800">Ưu điểm: {review.pros}</div> : null}
                      {review.cons ? <div className="rounded-lg bg-amber-50 p-3 text-amber-800">Nhược điểm: {review.cons}</div> : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

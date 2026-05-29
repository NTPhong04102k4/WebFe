import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";

import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import {
  useCarReviews,
  useCarReviewStats,
  useMyCarReview,
  useReviewMutations,
} from "@/query/review/useReviewQueries";
import type { CarResponseItem } from "@/shared/types/Reponse/Car";

function getImageSrc(car?: Partial<CarResponseItem> | null): string | undefined {
  if (!car) return undefined;
  const primary = car.primaryImagePath;
  if (typeof primary === "string" && primary.trim()) return primary;

  const images = car.imagePaths;
  if (Array.isArray(images)) {
    return images.find((item) => typeof item === "string" && item.trim());
  }

  if (typeof images === "string" && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.find((item) => typeof item === "string" && item.trim());
      }
    } catch {
      return images;
    }
  }

  return undefined;
}

function parseCarId(value: string | null | undefined) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export default function CustomerReviewsPage() {
  const params = useParams();
  const selectedCarId = useMemo(() => parseCarId(params.carId), [params.carId]);

  const [overallRating, setOverallRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const { createCarReview, updateCarReview } = useReviewMutations();

  const selectedCar = useQuery({
    queryKey: ["review-car-detail", selectedCarId],
    queryFn: ({ signal }) => carRouteFn.getDetail(selectedCarId!, { signal }),
    enabled: selectedCarId != null,
  });

  const reviews = useCarReviews({
    carId: selectedCarId ?? 0,
    page: 1,
    pageSize: 20,
    status: "Approved",
  });
  const stats = useCarReviewStats(selectedCarId);
  const myReview = useMyCarReview(selectedCarId);

  useEffect(() => {
    if (myReview.data) {
      const review = myReview.data;
      setOverallRating(review.overallRating);
      setTitle(review.title ?? "");
      setContent(review.content);
      setPros(review.pros ?? "");
      setCons(review.cons ?? "");
      return;
    }

    if (myReview.data === null) {
      setOverallRating(5);
      setTitle("");
      setContent("");
      setPros("");
      setCons("");
    }
  }, [myReview.data]);

  if (!selectedCarId) {
    return <Navigate to="/cars" replace />;
  }

  const isPending = createCarReview.isPending || updateCarReview.isPending;
  const isExistingReview = Boolean(myReview.data?.reviewID);
  const car = selectedCar.data as Partial<CarResponseItem> | undefined;
  const carName = car?.carName ?? `Xe #${selectedCarId}`;
  const carImage = getImageSrc(car);

  const submit = () => {
    if (!content.trim()) {
      notify.info("Vui lòng nhập nội dung đánh giá");
      return;
    }

    const body = {
      carID: selectedCarId,
      overallRating,
      title: title.trim() || null,
      content: content.trim(),
      pros: pros.trim() || null,
      cons: cons.trim() || null,
    };

    if (myReview.data?.reviewID) {
      updateCarReview.mutate(
        { id: myReview.data.reviewID, body },
        { onSuccess: () => notify.success("Đã cập nhật đánh giá") }
      );
      return;
    }

    createCarReview.mutate(body, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setPros("");
        setCons("");
        notify.success("Đã gửi đánh giá, vui lòng chờ duyệt");
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/cars" className="text-sm font-medium text-blue-700 hover:underline">
          Quay lại danh sách xe
        </Link>
        <Link to={`/cars/${selectedCarId}`} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Xem chi tiết xe
        </Link>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div className="aspect-[4/3] bg-slate-100 sm:aspect-auto">
            {carImage ? (
              <img src={carImage} alt={carName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center text-sm text-slate-400">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-sm font-medium text-blue-700">Review cho xe</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{carName}</h1>
            {selectedCar.isLoading ? (
              <p className="mt-2 text-sm text-slate-500">Đang tải thông tin xe...</p>
            ) : null}
            {stats.data ? (
              <p className="mt-2 text-sm text-slate-600">
                Trung bình {stats.data.averageRating}/5 từ {stats.data.reviewCount} đánh giá đã duyệt
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            {isExistingReview ? "Cập nhật review của bạn" : "Viết review cho xe này"}
          </h2>
          {isExistingReview ? (
            <p className="mt-1 text-xs text-amber-600">
              Bạn đã có review cho xe này. Chỉnh sửa và lưu để cập nhật.
            </p>
          ) : null}

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Điểm tổng thể</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={overallRating}
              onChange={(event) => setOverallRating(Number(event.target.value))}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} sao
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Tiêu đề</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Nội dung</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <textarea
              className="rounded-lg border px-3 py-2 text-sm"
              rows={3}
              placeholder="Ưu điểm"
              value={pros}
              onChange={(event) => setPros(event.target.value)}
            />
            <textarea
              className="rounded-lg border px-3 py-2 text-sm"
              rows={3}
              placeholder="Nhược điểm"
              value={cons}
              onChange={(event) => setCons(event.target.value)}
            />
          </div>

          <button
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={isPending || myReview.isLoading}
            onClick={submit}
          >
            {isPending ? "Đang lưu..." : isExistingReview ? "Cập nhật review" : "Gửi review"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">Review đã duyệt của xe này</h2>
            {stats.data ? (
              <p className="mt-1 text-sm text-slate-600">
                Trung bình {stats.data.averageRating}/5 từ {stats.data.reviewCount} đánh giá
              </p>
            ) : null}
          </div>
          <div className="divide-y">
            {reviews.isLoading ? (
              <div className="p-6 text-center text-slate-600">Đang tải...</div>
            ) : (reviews.data?.data ?? []).length === 0 ? (
              <div className="p-6 text-center text-slate-600">Chưa có review đã duyệt.</div>
            ) : (
              (reviews.data?.data ?? []).map((review) => (
                <div key={review.reviewID} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{review.title ?? review.carName}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {review.reviewerName ?? "Khách hàng"} - {review.overallRating}/5 sao
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(review.createdDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{review.content}</p>
                  {review.pros || review.cons ? (
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {review.pros ? (
                        <div className="rounded-lg bg-green-50 p-3 text-green-800">
                          Ưu điểm: {review.pros}
                        </div>
                      ) : null}
                      {review.cons ? (
                        <div className="rounded-lg bg-amber-50 p-3 text-amber-800">
                          Nhược điểm: {review.cons}
                        </div>
                      ) : null}
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

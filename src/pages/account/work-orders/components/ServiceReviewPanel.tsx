import { useState } from "react";
import { Star } from "lucide-react";

import {
  useServiceReviewByWorkOrder,
  useReviewMutations,
} from "src/query/review/useReviewQueries";
import { notify } from "@/components/core/Feedback/toast";
import { Checkbox } from "src/components/core/Form/Checkbox";
import LoadingSpinner from "src/components/common/LoadingSpinner";

import { StarPicker } from "./StarPicker";
import shell from "../../account-shell.module.scss";

type Props = {
  workOrderId: number;
  technicianId?: number | null;
  locationId?: number | null;
};

export function ServiceReviewPanel({ workOrderId, technicianId, locationId }: Props) {
  const { data: existing, isLoading, error } = useServiceReviewByWorkOrder(workOrderId);
  const { createServiceReview, deleteServiceReview } = useReviewMutations();

  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [attitudeRating, setAttitudeRating] = useState(5);
  const [content, setContent] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <LoadingSpinner size="sm" />;

  const notYetReviewed = error != null || existing == null;

  if (!notYetReviewed && existing) {
    return (
      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-700">Bạn đã đánh giá dịch vụ này</p>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < existing.overallRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
            />
          ))}
          <span className="ml-1 text-xs text-slate-500">
            {new Date(existing.createdDate).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{existing.content}</p>
        {existing.responseFromShop && (
          <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <span className="font-medium">Phản hồi:</span> {existing.responseFromShop}
          </div>
        )}
        <button
          className="mt-3 rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          disabled={deleteServiceReview.isPending}
          onClick={() => {
            if (!window.confirm("Xóa đánh giá này?")) return;
            deleteServiceReview.mutate(existing.reviewID, {
              onSuccess: () => notify.success("Đã xóa đánh giá"),
            });
          }}
        >
          Xóa đánh giá
        </button>
      </div>
    );
  }

  const submit = async () => {
    setSubmitted(true);
    if (!content.trim()) return;
    try {
      await createServiceReview.mutateAsync({
        workOrderID: workOrderId,
        technicianID: technicianId ?? null,
        locationID: locationId ?? null,
        overallRating,
        qualityRating,
        speedRating,
        attitudeRating,
        content: content.trim(),
        wouldRecommend,
      });
      notify.success("Đã gửi đánh giá dịch vụ");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="mb-3 text-sm font-medium text-slate-700">Đánh giá dịch vụ lần sửa này</p>

      <div className={shell.grid}>
        <div className={shell.field}>
          <label>Tổng thể</label>
          <StarPicker value={overallRating} onChange={setOverallRating} />
        </div>
        <div className={shell.field}>
          <label>Chất lượng sửa</label>
          <StarPicker value={qualityRating} onChange={setQualityRating} />
        </div>
        <div className={shell.field}>
          <label>Tốc độ</label>
          <StarPicker value={speedRating} onChange={setSpeedRating} />
        </div>
        <div className={shell.field}>
          <label>Thái độ KTV</label>
          <StarPicker value={attitudeRating} onChange={setAttitudeRating} />
        </div>
        <div className={shell.field} style={{ gridColumn: "1 / -1" }}>
          <label>Nhận xét</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />
          {submitted && !content.trim() && (
            <p className="mt-1 text-xs text-red-600">Bắt buộc</p>
          )}
        </div>
        <div className={shell.field}>
          <Checkbox
            label="Tôi sẽ giới thiệu cho người khác"
            checked={wouldRecommend}
            onChange={(e) => setWouldRecommend(e.target.checked)}
          />
        </div>
      </div>

      <button
        type="button"
        className={`${shell.btn} ${shell.primary}`}
        disabled={createServiceReview.isPending}
        onClick={submit}
      >
        {createServiceReview.isPending ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </div>
  );
}

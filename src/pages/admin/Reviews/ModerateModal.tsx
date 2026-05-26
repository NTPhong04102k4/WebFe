import { useState } from "react";
import { X, Star } from "lucide-react";
import type { CarReviewViewModel } from "src/services/api/functions/review/review.types";

type Action = "Approve" | "Reject";

type Props = {
  open: boolean;
  action: Action | null;
  review: CarReviewViewModel | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (action: Action, reason?: string) => void;
};

export function ModerateModal({ open, action, review, isPending, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  if (!open || !review || !action) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === "Reject" && !reason.trim()) return;
    onConfirm(action, reason.trim() || undefined);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className={`text-base font-semibold ${action === "Approve" ? "text-green-600" : "text-red-600"}`}>
            {action === "Approve" ? "✓ Duyệt đánh giá" : "✗ Từ chối đánh giá"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{review.reviewerName}</span>
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < review.overallRating ? "fill-current" : "text-slate-300"}`} />
                ))}
              </span>
            </div>
            {review.title && <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{review.title}</p>}
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{review.content}</p>
          </div>

          {action === "Reject" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Nhập lý do từ chối..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
              Hủy
            </button>
            <button type="submit" disabled={isPending || (action === "Reject" && !reason.trim())}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${action === "Approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {isPending ? "Đang xử lý..." : action === "Approve" ? "Duyệt" : "Từ chối"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

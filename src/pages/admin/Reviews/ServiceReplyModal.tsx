import { useState } from "react";
import { X, Star } from "lucide-react";
import type { ServiceReviewViewModel } from "src/services/api/functions/review/review.types";

type Props = {
  open: boolean;
  review: ServiceReviewViewModel | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (response: string) => void;
};

export function ServiceReplyModal({ open, review, isPending, onClose, onConfirm }: Props) {
  const [response, setResponse] = useState("");

  if (!open || !review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;
    onConfirm(response.trim());
    setResponse("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-blue-600">Phản hồi đánh giá dịch vụ</h2>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Phản hồi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              required
              placeholder="Nhập phản hồi của bạn..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
              Hủy
            </button>
            <button type="submit" disabled={isPending || !response.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isPending ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

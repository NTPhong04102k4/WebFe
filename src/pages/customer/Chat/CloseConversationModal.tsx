import { Star } from "lucide-react";

interface CloseConversationModalProps {
  rating: number;
  feedback: string;
  isPending: boolean;
  onRatingChange: (rating: number) => void;
  onFeedbackChange: (feedback: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CloseConversationModal({
  rating,
  feedback,
  isPending,
  onRatingChange,
  onFeedbackChange,
  onCancel,
  onConfirm,
}: CloseConversationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Đóng cuộc trò chuyện
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Hãy để lại đánh giá để giúp chúng tôi cải thiện dịch vụ.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Đánh giá chất lượng hỗ trợ
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRatingChange(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          rows={3}
          placeholder="Nhận xét thêm (không bắt buộc)..."
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
        />

        <div className="mt-4 flex gap-3">
          <button
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            disabled={isPending}
            onClick={onConfirm}
          >
            Xác nhận đóng
          </button>
        </div>
      </div>
    </div>
  );
}

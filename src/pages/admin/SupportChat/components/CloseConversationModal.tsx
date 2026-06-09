import { Modal } from "@/components/core/Modal/Modal";
import { Star } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  rating: number;
  onRatingChange: (v: number) => void;
  feedback: string;
  onFeedbackChange: (v: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function CloseConversationModal({
  open, onClose, rating, onRatingChange, feedback, onFeedbackChange, onConfirm, loading,
}: Props) {
  return (
    <Modal
      open={open}
      title="Đóng cuộc hội thoại"
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
            onClick={onConfirm}
          >
            Xác nhận đóng
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Thêm ghi chú hoặc xếp hạng nếu cần.</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Chất lượng hỗ trợ (tuỳ chọn)
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => onRatingChange(star)}>
              <Star className={`h-7 w-7 transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`} />
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
        rows={3}
        placeholder="Ghi chú về kết quả hỗ trợ..."
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
      />
    </Modal>
  );
}

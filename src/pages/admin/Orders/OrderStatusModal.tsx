import { useState } from "react";
import { X } from "lucide-react";

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled", "Refunded"] as const;

type Props = {
  open: boolean;
  orderNumber: string;
  currentStatus: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
};

export function OrderStatusModal({ open, orderNumber, currentStatus, isPending, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState(currentStatus);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Cập nhật trạng thái
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Đơn hàng: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{orderNumber}</span>
          </p>
          <div className="space-y-2">
            {ORDER_STATUSES.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={selected === s}
                  onChange={() => setSelected(s)}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={isPending || selected === currentStatus}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

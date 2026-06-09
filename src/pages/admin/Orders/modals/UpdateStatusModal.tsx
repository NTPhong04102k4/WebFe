import { useState } from "react";
import { Modal } from "src/components/core/Modal/Modal";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import { notify } from "src/components/core/Feedback/toast";
import { useUpdateOrderStatus } from "src/query/order/useOrderQueries";

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã huỷ" },
];

type Props = {
  open: boolean;
  orderId: string | number;
  currentStatus: string;
  onClose: () => void;
};

export function UpdateStatusModal({ open, orderId, currentStatus, onClose }: Props) {
  const [status, setStatus] = useState<OrderStatus>(
    ORDER_STATUSES.includes(currentStatus as OrderStatus)
      ? (currentStatus as OrderStatus)
      : "Pending"
  );
  const [notes, setNotes] = useState("");
  const updateStatus = useUpdateOrderStatus();

  const handleSubmit = () => {
    updateStatus.mutate(
      { id: orderId, status, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          notify.success("Cập nhật trạng thái thành công");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title="Cập nhật trạng thái đơn hàng"
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateStatus.isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateStatus.isPending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <Select
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Nhập ghi chú cho lần cập nhật này..."
            className="w-full resize-none rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>
      </div>
    </Modal>
  );
}

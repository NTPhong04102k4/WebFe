import { useState } from "react";
import { Modal } from "src/components/core/Modal/Modal";
import { Input } from "src/components/core/Form/Input";
import { notify } from "src/components/core/Feedback/toast";
import { useRecordCash } from "src/query/order/useOrderQueries";

type Props = {
  open: boolean;
  orderNumber: string;
  totalAmount: number;
  onClose: () => void;
};

export function RecordCashModal({ open, orderNumber, totalAmount, onClose }: Props) {
  const [amount, setAmount] = useState(totalAmount > 0 ? String(totalAmount) : "");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const recordCash = useRecordCash(orderNumber);

  const parsedAmount = Number(amount.replace(/\D/g, ""));
  const amountError = submitted && (!parsedAmount || parsedAmount <= 0)
    ? "Vui lòng nhập số tiền hợp lệ"
    : undefined;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!parsedAmount || parsedAmount <= 0) return;
    recordCash.mutate(
      {
        amount: parsedAmount,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          notify.success("Ghi nhận tiền mặt thành công");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title="Thu tiền mặt"
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={recordCash.isPending}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={recordCash.isPending}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {recordCash.isPending ? "Đang ghi..." : "Xác nhận thu"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input
          label="Số tiền (VNĐ)"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          placeholder="Nhập số tiền..."
          error={amountError}
        />
        <Input
          label="Số phiếu thu (tuỳ chọn)"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          placeholder="Mã phiếu thu / biên lai..."
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Ghi chú người thu (tuỳ chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Tên nhân viên thu tiền, ghi chú thêm..."
            className="w-full resize-none rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>
      </div>
    </Modal>
  );
}

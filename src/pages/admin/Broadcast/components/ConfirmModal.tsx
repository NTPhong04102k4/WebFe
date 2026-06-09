import { Modal } from "src/components/core/Modal/Modal";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClassName: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmClassName,
  isPending,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 ${confirmClassName}`}
          >
            {isPending ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-500">{message}</p>
    </Modal>
  );
}

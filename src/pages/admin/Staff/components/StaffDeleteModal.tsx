import { Modal } from "@/components/common";
import type { StaffResponse } from "src/services/api/functions/staff/staff.types";
import { ActionButton } from "../../Workshop/workshopUi";

type Props = {
  target: StaffResponse | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isPending: boolean;
};

export function StaffDeleteModal({ target, onConfirm, onClose, isPending }: Props) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title="Xác nhận xóa nhân viên"
      footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose} disabled={isPending}>
            Huỷ
          </ActionButton>
          <ActionButton variant="danger" disabled={isPending} onClick={onConfirm}>
            {isPending ? "Đang xóa..." : "Xóa"}
          </ActionButton>
        </div>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Bạn có chắc muốn xóa nhân viên{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {target?.fullName}
        </span>
        ? Hành động này không thể hoàn tác.
      </p>
    </Modal>
  );
}

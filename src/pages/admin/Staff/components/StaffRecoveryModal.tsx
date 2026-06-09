import type { UseFormReturn } from "react-hook-form";

import { Input, Modal } from "@/components/common";
import { ActionButton } from "../../Workshop/workshopUi";
import type { RecoveryForm } from "../staffHelpers";

type Props = {
  open: boolean;
  form: UseFormReturn<RecoveryForm>;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
};

export function StaffRecoveryModal({ open, form, onSave, onClose, isPending }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Khôi phục mật khẩu SuperAdmin"
      footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Huỷ</ActionButton>
          <ActionButton variant="primary" onClick={onSave} disabled={isPending}>
            Đặt lại mật khẩu
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Recovery code"
          type="password"
          required
          error={errors.recoveryCode?.message}
          {...register("recoveryCode", { required: "Bắt buộc" })}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          error={errors.newPassword?.message}
          {...register("newPassword", { required: "Bắt buộc" })}
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", { required: "Bắt buộc" })}
        />
      </div>
    </Modal>
  );
}

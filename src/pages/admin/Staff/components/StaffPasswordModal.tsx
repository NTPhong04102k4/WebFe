import type { UseFormReturn } from "react-hook-form";

import { Input, Modal } from "@/components/common";
import type { StaffResponse } from "src/services/api/functions/staff/staff.types";
import { ActionButton } from "../../Workshop/workshopUi";
import type { PasswordForm } from "../staffHelpers";

type Props = {
  target: StaffResponse | null;
  form: UseFormReturn<PasswordForm>;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
};

export function StaffPasswordModal({ target, form, onSave, onClose, isPending }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={`Đổi mật khẩu${target ? ` — ${target.fullName}` : ""}`}
      footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Huỷ</ActionButton>
          <ActionButton variant="primary" onClick={onSave} disabled={isPending}>
            Lưu
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          helperText="Bắt buộc khi đổi mật khẩu của chính mình. SuperAdmin đổi cho người khác có thể để trống."
          {...register("currentPassword")}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          error={errors.newPassword?.message}
          {...register("newPassword", { required: "Bắt buộc" })}
        />
      </div>
    </Modal>
  );
}

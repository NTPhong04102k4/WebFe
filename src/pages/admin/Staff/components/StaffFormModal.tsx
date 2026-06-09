import type { UseFormReturn } from "react-hook-form";

import { Input, Modal } from "@/components/common";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import type { StaffResponse } from "src/services/api/functions/staff/staff.types";
import type { LocationResponse } from "src/shared/types/Reponse/Location";
import { ActionButton } from "../../Workshop/workshopUi";
import {
  locationIdOf,
  roleNameOf,
  ROLE_OPTIONS,
  type LocationOption,
  type StaffForm,
} from "../staffHelpers";

type Props = {
  open: boolean;
  editing: StaffResponse | null;
  locations: LocationResponse[];
  locationsLoading: boolean;
  form: UseFormReturn<StaffForm>;
  onSave: () => void;
  onClose: () => void;
  isSavePending: boolean;
};

export function StaffFormModal({
  open,
  editing,
  locations,
  locationsLoading,
  form,
  onSave,
  onClose,
  isSavePending,
}: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const locationOptions: SelectOption[] = locations.map((loc, idx) => ({
    value: String(locationIdOf(loc as LocationOption, idx)),
    label: String(loc.locationName ?? ""),
  }));

  const roleOptions: SelectOption[] = [
    ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
    ...(editing?.roleID && !ROLE_OPTIONS.some((r) => r.value === String(editing.roleID))
      ? [{ value: String(editing.roleID), label: roleNameOf(editing) }]
      : []),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Cập nhật nhân viên" : "Tạo nhân viên mới"}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>Huỷ</ActionButton>
          <ActionButton variant="primary" onClick={onSave} disabled={isSavePending}>
            Lưu
          </ActionButton>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Username"
          required={!editing}
          disabled={Boolean(editing)}
          error={errors.username?.message}
          {...register("username", { required: !editing ? "Bắt buộc" : false })}
        />
        <Input
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email", { required: "Bắt buộc" })}
        />
        {!editing ? (
          <Input
            label="Password"
            type="password"
            required
            error={errors.password?.message}
            {...register("password", { required: "Bắt buộc" })}
          />
        ) : null}
        <Input
          label="Ho ten"
          required
          error={errors.fullName?.message}
          {...register("fullName", { required: "Bắt buộc" })}
        />
        <Input
          label="Phone"
          required
          error={errors.phone?.message}
          {...register("phone", { required: "Bắt buộc" })}
        />
        <Select
          label="Location"
          options={locationOptions}
          placeholder="Chon location"
          required
          disabled={locationsLoading}
          value={watch("locationID")}
          onChange={(e) => setValue("locationID", e.target.value, { shouldValidate: true })}
          error={errors.locationID?.message}
        />
        <Select
          label="Role"
          options={roleOptions}
          placeholder="Chon role"
          required
          value={watch("roleID")}
          onChange={(e) => setValue("roleID", e.target.value, { shouldValidate: true })}
          error={errors.roleID?.message}
        />
      </div>
    </Modal>
  );
}

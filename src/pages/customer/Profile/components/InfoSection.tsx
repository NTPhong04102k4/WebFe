import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/core";
import { Select } from "@/components/core";
import {
  profileEditSchema,
  type ProfileEditValues,
} from "@/query/user/useProfileQuery";

const GENDER_LABEL: Record<string, string> = {
  Male: "Nam",
  Female: "Nữ",
  Other: "Khác",
};

const GENDER_OPTIONS = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "Other", label: "Khác" },
];

function InfoRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

interface InfoSectionProps {
  defaultValues: ProfileEditValues & { gender?: string; dateOfBirth?: string };
  onSave: (values: ProfileEditValues) => Promise<void>;
  isSaving: boolean;
}

export function InfoSection({ defaultValues, onSave, isSaving }: InfoSectionProps) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues,
  });

  const handleCancel = () => {
    reset(defaultValues);
    setEditing(false);
  };

  const onSubmit = async (values: ProfileEditValues) => {
    await onSave(values);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Thông tin cá nhân</h2>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Chỉnh sửa
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Họ tên" value={defaultValues.fullName} />
          <InfoRow label="Email" value={defaultValues.email} />
          <InfoRow label="Username" value={defaultValues.username} />
          <InfoRow label="Số CCCD/CMND" value={defaultValues.identityNumber} />
          <InfoRow label="Số điện thoại" value={defaultValues.phone || "—"} />
          <InfoRow label="Địa chỉ" value={defaultValues.address || "—"} wide />
          <InfoRow
            label="Giới tính"
            value={
              defaultValues.gender
                ? (GENDER_LABEL[defaultValues.gender] ?? defaultValues.gender)
                : "—"
            }
          />
          <InfoRow
            label="Ngày sinh"
            value={
              defaultValues.dateOfBirth
                ? new Date(defaultValues.dateOfBirth).toLocaleDateString("vi-VN")
                : "—"
            }
          />
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Chỉnh sửa thông tin</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <Input
          label="Họ và tên"
          required
          error={errors.fullName?.message}
          placeholder="Nguyễn Văn A"
          {...register("fullName")}
        />

        <Input
          label="Email"
          required
          type="email"
          error={errors.email?.message}
          placeholder="example@email.com"
          {...register("email")}
        />

        <Input
          label="Username"
          required
          error={errors.username?.message}
          placeholder="username"
          {...register("username")}
        />

        <Input
          label="Số CCCD/CMND"
          required
          error={errors.identityNumber?.message}
          placeholder="012345678901"
          {...register("identityNumber")}
        />

        <Input
          label="Số điện thoại"
          error={errors.phone?.message}
          placeholder="0912345678"
          {...register("phone")}
        />

        <Input
          label="Địa chỉ"
          error={errors.address?.message}
          placeholder="123 Đường ABC, Quận 1, TP.HCM"
          {...register("address")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Giới tính"
            error={errors.gender?.message}
            options={GENDER_OPTIONS}
            placeholder="— Chọn —"
            {...register("gender")}
          />

          <Input
            label="Ngày sinh"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

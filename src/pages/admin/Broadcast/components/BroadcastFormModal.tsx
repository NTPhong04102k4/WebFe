import { useState } from "react";
import { Users, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Modal } from "src/components/core/Modal/Modal";
import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import { StaffPickerModal } from "src/components/common/StaffPickerModal";
import type { BroadcastViewModel } from "src/shared/types/Reponse/Broadcast";
import type { BroadcastRequest } from "src/shared/types/Request/Broadcast";

type FormValues = {
  title: string;
  body: string;
  targetType: "Customer" | "Staff" | "Both";
  staffRoleFilter: string;
  scheduledAt: string;
};

const TARGET_OPTIONS: SelectOption[] = [
  { value: "Customer", label: "Khách hàng (FCM push)" },
  { value: "Staff", label: "Nhân viên (Email)" },
  { value: "Both", label: "Tất cả" },
];

type Props = {
  initial?: BroadcastViewModel;
  onClose: () => void;
  onSubmit: (data: BroadcastRequest) => void;
  loading: boolean;
};

export function BroadcastFormModal({ initial, onClose, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      targetType: (initial?.targetType as FormValues["targetType"]) ?? "Customer",
      staffRoleFilter: initial?.staffRoleFilter ?? "",
      scheduledAt: initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : "",
    },
  });

  const [selectedStaffIDs, setSelectedStaffIDs] = useState<number[]>(initial?.targetStaffIDs ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const targetType = watch("targetType");
  const targetingStaff = targetType === "Staff" || targetType === "Both";

  const submit = (vals: FormValues) => {
    onSubmit({
      title: vals.title,
      body: vals.body,
      targetType: vals.targetType,
      staffRoleFilter: selectedStaffIDs.length > 0 ? undefined : (vals.staffRoleFilter || undefined),
      scheduledAt: vals.scheduledAt ? new Date(vals.scheduledAt).toISOString() : undefined,
      targetStaffIDs: selectedStaffIDs.length > 0 ? selectedStaffIDs : undefined,
    });
  };

  return (
    <>
      <Modal
        open
        title={initial ? "Chỉnh sửa broadcast" : "Tạo broadcast mới"}
        onClose={onClose}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Huỷ
            </button>
            <button
              form="broadcast-form"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        }
      >
        <form id="broadcast-form" onSubmit={handleSubmit(submit)} className="space-y-3">
          <Input
            label="Tiêu đề"
            required
            placeholder="Tiêu đề thông báo..."
            error={errors.title?.message}
            {...register("title", { required: "Bắt buộc" })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("body", { required: "Bắt buộc" })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
              placeholder="Nội dung thông báo..."
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
          </div>

          <Select
            label="Đối tượng"
            options={TARGET_OPTIONS}
            {...register("targetType")}
          />

          {targetingStaff && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nhân viên nhận thông báo
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  {selectedStaffIDs.length > 0 ? "Thay đổi" : "Chọn nhân viên"}
                </button>
              </div>

              {selectedStaffIDs.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <Users className="h-3 w-3" />
                    {selectedStaffIDs.length} nhân viên được chọn
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffIDs([])}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" /> Xóa tất cả
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Chưa chọn nhân viên cụ thể — hoặc lọc theo vai trò bên dưới (chỉ SuperAdmin).
                </p>
              )}

              {selectedStaffIDs.length === 0 && (
                <Input
                  label="Lọc theo vai trò"
                  placeholder="VD: Technician, Admin..."
                  helperText="để trống = tất cả nhân viên"
                  {...register("staffRoleFilter")}
                />
              )}
            </div>
          )}

          <Input
            label="Gửi lúc"
            type="datetime-local"
            helperText="để trống = lưu nháp"
            {...register("scheduledAt")}
          />
        </form>
      </Modal>

      <StaffPickerModal
        open={pickerOpen}
        selected={selectedStaffIDs}
        onConfirm={(ids) => {
          setSelectedStaffIDs(ids);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}

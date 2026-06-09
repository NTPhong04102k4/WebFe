import React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import type { ApptForm } from "../useAppointmentsHandler";

const APPT_TYPE_OPTIONS: SelectOption[] = [
  { value: "Maintenance", label: "Bảo dưỡng" },
  { value: "Repair", label: "Sửa chữa" },
  { value: "Inspection", label: "Kiểm tra" },
];

type Props = {
  form: UseFormReturn<ApptForm>;
  vehicleOptions: SelectOption[];
  locationOptions: SelectOption[];
  locLoading: boolean;
  onSubmit: (f: ApptForm) => Promise<void>;
  isCreating: boolean;
};

export function AppointmentForm({ form, vehicleOptions, locationOptions, locLoading, onSubmit, isCreating }: Props) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Xe"
          required
          placeholder="— Chọn xe —"
          options={vehicleOptions}
          error={errors.customerVehicleID?.message}
          {...register("customerVehicleID", {
            valueAsNumber: true,
            validate: (v) => (v > 0 ? true : "Vui lòng chọn xe"),
          })}
        />

        <Select
          label="Chi nhánh"
          required
          placeholder="— Chọn —"
          options={locationOptions}
          disabled={locLoading}
          error={errors.locationID?.message}
          {...register("locationID", {
            valueAsNumber: true,
            validate: (v) => (v > 0 ? true : "Vui lòng chọn chi nhánh"),
          })}
        />

        <Input
          type="date"
          label="Ngày *"
          error={errors.scheduledDate?.message}
          {...register("scheduledDate", { required: "Vui lòng chọn ngày" })}
        />

        <Input
          type="time"
          label="Giờ *"
          error={errors.scheduledTime?.message}
          {...register("scheduledTime", { required: "Vui lòng chọn giờ" })}
        />

        <Input
          type="number"
          label="Thời lượng (phút)"
          min={15}
          max={1440}
          {...register("estimatedDuration_minutes", { valueAsNumber: true })}
        />

        <Select
          label="Loại hình"
          options={APPT_TYPE_OPTIONS}
          {...register("appointmentType")}
        />

        <div className="space-y-1 sm:col-span-2">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">Ghi chú</label>
          <textarea
            className="w-full min-h-[80px] resize-y rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
            {...register("customerNote")}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isCreating}
        >
          Gửi lịch
        </button>
      </div>
    </form>
  );
}

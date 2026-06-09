import type { UseFormReturn } from "react-hook-form";

import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import type { FormValues } from "../useGarageHandler";
import shell from "../../account-shell.module.scss";

type Props = {
  form: UseFormReturn<FormValues>;
  editingId: number | null;
  brandOptions: SelectOption[];
  loadingBrands: boolean;
  isPending: boolean;
  onSubmit: (values: FormValues) => void;
  cancelEdit: () => void;
};

export function VehicleForm({
  form,
  editingId,
  brandOptions,
  loadingBrands,
  isPending,
  onSubmit,
  cancelEdit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className={shell.card}>
      <h3 className={shell.title} style={{ fontSize: "1rem" }}>
        {editingId != null ? "Sửa xe" : "Thêm xe mới"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={shell.grid}>
          <Input
            label="VIN"
            required
            error={errors.vin?.message}
            {...register("vin", { required: "Bắt buộc" })}
          />
          <Input
            label="Biển số"
            {...register("licensePlate")}
          />
          <Select
            label="Hãng"
            required
            options={brandOptions}
            placeholder="— Chọn —"
            disabled={loadingBrands}
            error={errors.brandID?.message}
            {...register("brandID", {
              valueAsNumber: true,
              validate: (v) => (v > 0 ? true : "Chọn hãng xe"),
            })}
          />
          <Input
            label="Dòng xe"
            required
            error={errors.modelName?.message}
            {...register("modelName", { required: "Bắt buộc" })}
          />
          <Input
            label="Năm SX"
            required
            type="number"
            {...register("modelYear", { valueAsNumber: true })}
          />
          <Input
            label="Màu"
            {...register("color")}
          />
          <Input
            label="Km hiện tại"
            required
            type="number"
            {...register("currentMileage", { valueAsNumber: true })}
          />
        </div>
        <div className={shell.btnRow}>
          <button
            type="submit"
            className={`${shell.btn} ${shell.primary}`}
            disabled={isPending}
          >
            {editingId != null ? "Lưu thay đổi" : "Thêm xe"}
          </button>
          {editingId != null && (
            <button
              type="button"
              className={`${shell.btn} ${shell.secondary}`}
              onClick={cancelEdit}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

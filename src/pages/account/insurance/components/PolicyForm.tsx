import type { UseFormReturn } from "react-hook-form";

import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import type { PolicyForm } from "../useInsuranceHandler";
import shell from "../../account-shell.module.scss";

type Props = {
  form: UseFormReturn<PolicyForm>;
  vehicleOptions: SelectOption[];
  packageOptions: SelectOption[];
  isPending: boolean;
  onSubmit: (values: PolicyForm) => Promise<void>;
};

export function PolicyFormPanel({
  form,
  vehicleOptions,
  packageOptions,
  isPending,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className={shell.card}>
      <h3 className={shell.title} style={{ fontSize: "1rem" }}>
        Tạo hợp đồng (gói &amp; thời hạn)
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={shell.grid}>
          <Select
            label="Xe"
            required
            options={vehicleOptions}
            placeholder="— Chọn —"
            error={errors.customerVehicleID?.message}
            {...register("customerVehicleID", {
              valueAsNumber: true,
              validate: (v) => (v > 0 ? true : "Chọn xe"),
            })}
          />
          <Select
            label="Gói bảo hiểm"
            required
            options={packageOptions}
            placeholder="— Chọn —"
            error={errors.packageID?.message}
            {...register("packageID", {
              valueAsNumber: true,
              validate: (v) => (v > 0 ? true : "Chọn gói bảo hiểm"),
            })}
          />
          <Input
            label="Bắt đầu"
            required
            type="date"
            error={errors.startDate?.message}
            {...register("startDate", { required: "Bắt buộc" })}
          />
          <Input
            label="Kết thúc"
            required
            type="date"
            error={errors.endDate?.message}
            {...register("endDate", { required: "Bắt buộc" })}
          />
          <Input
            label="Phí thực trả"
            type="number"
            {...register("premiumAmount", { valueAsNumber: true })}
          />
        </div>
        <button
          type="submit"
          className={`${shell.btn} ${shell.primary}`}
          disabled={isPending}
        >
          Gửi hợp đồng
        </button>
      </form>
    </div>
  );
}

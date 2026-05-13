import { Controller, type UseFormReturn } from "react-hook-form";

import { Input, Modal } from "src/components/core";

import type { BodyTypeFormValues } from "../customHookModule/useBodyTypeManagement";
import type { BodyCarReponse } from "src/shared/types/Reponse/Car";

type BodyTypeFormModalProps = {
  open: boolean;
  editingBodyType: BodyCarReponse | null;
  isSaving: boolean;
  form: UseFormReturn<BodyTypeFormValues>;
  onClose: () => void;
  onSubmit: () => void;
};

export function BodyTypeFormModal({
  open,
  editingBodyType,
  isSaving,
  form,
  onClose,
  onSubmit,
}: BodyTypeFormModalProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editingBodyType ? "Chinh sua kieu than xe" : "Tao kieu than xe"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="submit"
            form="body-type-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {editingBodyType ? "Luu thay doi" : "Tao kieu than"}
          </button>
        </div>
      }
    >
      <form id="body-type-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input
          label="Ma kieu than"
          readOnly={Boolean(editingBodyType)}
          error={errors.bodyCode?.message}
          className="read-only:bg-slate-50"
          {...register("bodyCode", {
            required: "Vui long nhap ma kieu than",
            setValueAs: (value) => String(value).trim(),
          })}
        />
        <Input
          label="Ten kieu than"
          error={errors.bodyName?.message}
          {...register("bodyName", {
            required: "Vui long nhap ten kieu than",
            setValueAs: (value) => String(value).trim(),
          })}
        />
        <Input
          label="Khoang so ghe"
          placeholder="VD: 4-5"
          className="md:col-span-2"
          {...register("seatCapacityRange")}
        />
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Mo ta</span>
          <textarea
            className="min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            {...register("description")}
          />
        </label>
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange } }) => (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Anh</span>
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
              />
            </label>
          )}
        />
      </form>
    </Modal>
  );
}

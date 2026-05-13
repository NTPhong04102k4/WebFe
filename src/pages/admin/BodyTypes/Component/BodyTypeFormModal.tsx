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
            className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-blue-300/30"
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="submit"
            form="body-type-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900"
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
          className="read-only:bg-slate-200 dark:read-only:bg-slate-800"
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
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Mo ta</span>
          <textarea
            className="min-h-[88px] rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-300 dark:focus:ring-blue-300/30"
            {...register("description")}
          />
        </label>
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange } }) => (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Anh</span>
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

import { Controller, type UseFormReturn } from "react-hook-form";

import { Input, Modal } from "src/components/core";

import type { BrandFormValues } from "../customHookModule/useBrandManagement";
import type { BrandCarResponse } from "src/shared/types/Reponse/Car";

type BrandFormModalProps = {
  open: boolean;
  editingBrand: BrandCarResponse | null;
  isSaving: boolean;
  form: UseFormReturn<BrandFormValues>;
  onClose: () => void;
  onSubmit: () => void;
};

export function BrandFormModal({
  open,
  editingBrand,
  isSaving,
  form,
  onClose,
  onSubmit,
}: BrandFormModalProps) {
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
      title={editingBrand ? "Chinh sua hang xe" : "Tao hang xe"}
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
            form="brand-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900"
          >
            {editingBrand ? "Luu thay doi" : "Tao hang"}
          </button>
        </div>
      }
    >
      <form id="brand-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input
          label="Ma hang"
          readOnly={Boolean(editingBrand)}
          error={errors.brandCode?.message}
          className="read-only:bg-slate-200 dark:read-only:bg-slate-800"
          {...register("brandCode", {
            required: "Vui long nhap ma hang",
            setValueAs: (value) => String(value).trim(),
          })}
        />
        <Input
          label="Ten hang"
          error={errors.brandName?.message}
          {...register("brandName", {
            required: "Vui long nhap ten hang",
            setValueAs: (value) => String(value).trim(),
          })}
        />
        <Input label="Quoc gia" {...register("countryOrigin")} />
        <Input label="Website" {...register("website")} />
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Mo ta</span>
          <textarea
            className="min-h-[88px] rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-300 dark:focus:ring-blue-300/30"
            {...register("description")}
          />
        </label>
        <Controller
          name="logo"
          control={control}
          render={({ field: { onChange } }) => (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Logo</span>
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

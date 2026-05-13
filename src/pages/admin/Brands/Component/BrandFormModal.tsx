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
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="submit"
            form="brand-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
          className="read-only:bg-slate-50"
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
          <span className="text-sm font-medium text-slate-700">Mo ta</span>
          <textarea
            className="min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            {...register("description")}
          />
        </label>
        <Controller
          name="logo"
          control={control}
          render={({ field: { onChange } }) => (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Logo</span>
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

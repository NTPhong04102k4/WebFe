import { Controller } from "react-hook-form";

import { Input, Modal, Select } from "src/components/core";
import type { AccessoryManagerState } from "../data";

type AccessoryFormModalProps = Pick<
  AccessoryManagerState,
  "categories" | "brands" | "editingAccessory" | "form" | "isSaving" | "modalOpen" | "closeModal" | "submitForm"
>;

const getBrandValue = (brand: { name: string }, index: number) =>
  String((brand as { brandAccessoryID?: number; id?: number }).brandAccessoryID ?? (brand as { id?: number }).id ?? index + 1);

export function AccessoryFormModal({
  categories,
  brands,
  editingAccessory,
  form,
  isSaving,
  modalOpen,
  closeModal,
  submitForm,
}: AccessoryFormModalProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: category.categoryID,
  }));
  const brandOptions = brands.map((brand, index) => ({
    label: brand.name,
    value: getBrandValue(brand, index),
  }));

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      size="xl"
      title={editingAccessory ? "Chinh sua phu kien" : "Tao phu kien"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={closeModal}
          >
            Huy
          </button>
          <button
            type="submit"
            form="accessory-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {editingAccessory ? "Luu thay doi" : "Tao phu kien"}
          </button>
        </div>
      }
    >
      <form id="accessory-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitForm}>
        <Input
          label="Ma phu kien"
          readOnly={Boolean(editingAccessory)}
          error={errors.accessoryCode?.message}
          className="read-only:bg-slate-200 dark:read-only:bg-slate-800"
          {...register("accessoryCode", { required: "Vui long nhap ma phu kien" })}
        />
        <Input
          label="Ten phu kien"
          error={errors.accessoryName?.message}
          {...register("accessoryName", { required: "Vui long nhap ten phu kien" })}
        />
        <Select
          label="Danh muc"
          placeholder="Chon danh muc"
          options={categoryOptions}
          error={errors.categoryID?.message}
          {...register("categoryID", { required: "Vui long chon danh muc" })}
        />
        <Select label="Thuong hieu" placeholder="Chon thuong hieu" options={brandOptions} {...register("brandAccessoryID")} />
        <Input label="Gia ban" type="number" min="0" error={errors.price?.message} {...register("price", { required: "Vui long nhap gia ban" })} />
        <Input label="Gia von" type="number" min="0" {...register("costPrice")} />
        <Input label="Ton kho" type="number" min="0" {...register("stockQuantity")} />
        <Input label="Bao hanh (thang)" type="number" min="0" {...register("warrantyMonths")} />
        <Input label="Ton toi thieu" type="number" min="0" {...register("minStockLevel")} />
        <Input label="Ton toi da" type="number" min="0" {...register("maxStockLevel")} />
        <Input label="Dong xe tuong thich" className="md:col-span-2" {...register("compatibleCarModels")} />
        <Input label="Mo ta" className="md:col-span-2" {...register("description")} />
        <Controller
          name="imagePath"
          control={control}
          render={({ field: { onChange } }) => (
            <Input label="Anh phu kien" type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
          )}
        />
        <Controller
          name="installationVideo"
          control={control}
          render={({ field: { onChange } }) => (
            <Input label="Video lap dat" type="file" accept="video/*" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
          )}
        />
      </form>
    </Modal>
  );
}

import { Controller } from "react-hook-form";

import { Checkbox, Input, Modal, Select } from "src/components/core";
import type { CategoryManagerState } from "../data";

type CategoryFormModalProps = Pick<
  CategoryManagerState,
  "categories" | "editingCategory" | "form" | "isSaving" | "modalOpen" | "closeModal" | "submitForm"
>;

export function CategoryFormModal({
  categories,
  editingCategory,
  form,
  isSaving,
  modalOpen,
  closeModal,
  submitForm,
}: CategoryFormModalProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const parentOptions = categories
    .filter((category) => category.categoryID !== editingCategory?.categoryID)
    .map((category) => ({
      label: category.categoryName,
      value: category.categoryID,
    }));

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      size="lg"
      title={editingCategory ? "Chinh sua danh muc" : "Tao danh muc"}
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
            form="category-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {editingCategory ? "Luu thay doi" : "Tao danh muc"}
          </button>
        </div>
      }
    >
      <form id="category-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitForm}>
        <Input
          label="Ten danh muc"
          className="md:col-span-2"
          error={errors.categoryName?.message}
          {...register("categoryName", { required: "Vui long nhap ten danh muc" })}
        />
        <Select label="Danh muc cha" placeholder="Khong co" options={parentOptions} {...register("parentCategoryID")} />
        <Input label="Thu tu hien thi" type="number" min="0" {...register("displayOrder")} />
        <Input label="Mo ta" className="md:col-span-2" {...register("description")} />
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Dang kich hoat"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />
      </form>
    </Modal>
  );
}

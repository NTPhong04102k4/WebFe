import { useMemo } from "react";
import { Controller } from "react-hook-form";

import { Checkbox, ComboTreeBox, type ComboTreeItem, Input, Modal } from "src/components/core";
import type { CategoryResponse } from "src/shared/types/Reponse/category";
import type { CategoryManagerState } from "../data";

type CategoryFormModalProps = Pick<
  CategoryManagerState,
  "categories" | "editingCategory" | "form" | "isSaving" | "modalOpen" | "closeModal" | "submitForm"
>;

function buildCategoryTree(
  categories: CategoryResponse[],
  excludeId: number | undefined,
): ComboTreeItem[] {
  const pool = excludeId
    ? categories.filter((c) => c.categoryID !== excludeId)
    : categories;

  const childrenOf = (parentId: number): ComboTreeItem[] =>
    pool
      .filter((c) => c.parentCategoryID === parentId)
      .map((c) => {
        const children = childrenOf(c.categoryID);
        return {
          id: String(c.categoryID),
          label: c.categoryName,
          ...(children.length ? { children } : {}),
        };
      });

  return pool
    .filter((c) => !c.parentCategoryID)
    .map((c) => {
      const children = childrenOf(c.categoryID);
      return {
        id: String(c.categoryID),
        label: c.categoryName,
        ...(children.length ? { children } : {}),
      };
    });
}

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

  const parentTreeItems = useMemo(
    () => buildCategoryTree(categories, editingCategory?.categoryID),
    [categories, editingCategory?.categoryID],
  );

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      size="lg"
      title={editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={closeModal}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
          </button>
        </div>
      }
    >
      <form id="category-form" className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitForm}>
        <Input
          label="Tên danh mục"
          className="md:col-span-2"
          error={errors.categoryName?.message}
          {...register("categoryName", { required: "Vui lòng nhập tên danh mục" })}
        />
        <Controller
          name="parentCategoryID"
          control={control}
          render={({ field }) => (
            <ComboTreeBox
              label="Danh mục cha"
              placeholder="Không có"
              items={parentTreeItems}
              value={field.value || undefined}
              onChange={(id) => field.onChange(id)}
              onClear={() => field.onChange("")}
            />
          )}
        />
        <Input label="Thứ tự hiển thị" type="number" min="0" {...register("displayOrder")} />
        <Input label="Mô tả" className="md:col-span-2" {...register("description")} />
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Đang kích hoạt"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />
      </form>
    </Modal>
  );
}

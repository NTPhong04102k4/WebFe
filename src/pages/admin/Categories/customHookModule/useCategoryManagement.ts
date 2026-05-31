import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import { useServiceCategoryList, useServiceCategoryMutations } from "src/query/service-category/useServiceCategoryQueries";
import type { CategoryResponse } from "src/shared/types/Reponse/category";
import type { CategoryRequestCreate } from "src/shared/types/Request/Category";
import type { CategoryFormValues } from "../data";

const emptyForm: CategoryFormValues = {
  categoryName: "",
  description: "",
  parentCategoryID: "",
  displayOrder: "0",
  isActive: true,
};

function formFromCategory(category: CategoryResponse): CategoryFormValues {
  return {
    categoryName: category.categoryName ?? "",
    description: category.description ?? "",
    parentCategoryID: category.parentCategoryID ? String(category.parentCategoryID) : "",
    displayOrder: String(category.displayOrder ?? 0),
    isActive: Boolean(category.isActive),
  };
}

function toPayload(values: CategoryFormValues): CategoryRequestCreate {
  return {
    categoryName: values.categoryName.trim(),
    description: values.description.trim(),
    parentCategoryID: values.parentCategoryID ? Number(values.parentCategoryID) : null,
    displayOrder: Number(values.displayOrder) || 0,
    isActive: values.isActive,
  };
}

export function useCategoryManagement() {
  const { data: categories = [], isLoading, isFetching, error } = useServiceCategoryList();
  const { createCategory, updateCategory } = useServiceCategoryMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);

  const form = useForm<CategoryFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((category) =>
      [category.categoryName, category.description, category.categoryID]
        .filter((value) => value != null)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [categories, search]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    form.reset(emptyForm);
  };

  const openCreate = () => {
    setEditingCategory(null);
    form.reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    form.reset(formFromCategory(category));
    setModalOpen(true);
  };

  const submitForm = form.handleSubmit(async (values) => {
    try {
      const payload = toPayload(values);

      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.categoryID, data: payload });
        notify.success("Cập nhật danh mục thành công");
      } else {
        await createCategory.mutateAsync(payload);
        notify.success("Tạo danh mục thành công");
      }

      closeModal();
    } catch {
      // interceptor đã hiển thị toast lỗi
    }
  });

  const reorderCategories = async (nextCategories: CategoryResponse[]) => {
    try {
      await Promise.all(
        nextCategories.map((category, index) =>
          updateCategory.mutateAsync({
            id: category.categoryID,
            data: {
              categoryName: category.categoryName,
              description: category.description ?? "",
              parentCategoryID: category.parentCategoryID,
              displayOrder: index + 1,
              isActive: category.isActive,
            },
          })
        )
      );
      notify.success("Cập nhật thứ tự danh mục thành công");
    } catch {
      // interceptor đã hiển thị toast lỗi
    }
  };

  return {
    categories: filteredCategories,
    editingCategory,
    error: error as Error | null,
    form,
    isLoading,
    isSaving: createCategory.isPending || updateCategory.isPending,
    isSyncing: isFetching && !isLoading,
    modalOpen,
    search,
    closeModal,
    openCreate,
    openEdit,
    reorderCategories,
    setSearch,
    submitForm,
  };
}

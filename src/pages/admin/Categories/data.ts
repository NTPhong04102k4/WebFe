import type { UseFormReturn } from "react-hook-form";

import type { CategoryResponse } from "src/shared/types/Reponse/category";

export type CategoryFormValues = {
  categoryName: string;
  description: string;
  parentCategoryID: string;
  displayOrder: string;
  isActive: boolean;
};

export type CategoryManagerState = {
  categories: CategoryResponse[];
  editingCategory: CategoryResponse | null;
  error: Error | null;
  form: UseFormReturn<CategoryFormValues>;
  isLoading: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  modalOpen: boolean;
  search: string;
  closeModal: () => void;
  openCreate: () => void;
  openEdit: (category: CategoryResponse) => void;
  reorderCategories: (categories: CategoryResponse[]) => void;
  setSearch: (value: string) => void;
  submitForm: () => void;
};

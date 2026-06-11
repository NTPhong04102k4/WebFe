import type { UseFormReturn } from "react-hook-form";

import type { MultiComboboxOption } from "src/components/core";
import type {
  AccessoriesListItem,
  AccessoryDetailResponse,
} from "src/shared/types/Reponse/accessories/accessory";
import type { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import type { CategoryResponse } from "src/shared/types/Reponse/category";

export const ACCESSORY_SORT_OPTIONS = [
  { label: "Mặc định", value: "" },
  { label: "Tên: A → Z", value: "accessoryName:asc" },
  { label: "Tên: Z → A", value: "accessoryName:desc" },
  { label: "Giá: Tăng dần", value: "price:asc" },
  { label: "Giá: Giảm dần", value: "price:desc" },
  { label: "Tồn kho: Tăng dần", value: "stockQuantity:asc" },
  { label: "Tồn kho: Giảm dần", value: "stockQuantity:desc" },
] as const;

export type AccessoryFormValues = {
  accessoryCode: string;
  accessoryName: string;
  categoryID: string;
  brandAccessoryID: string;
  description: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  compatibleBrands: string[];
  compatibleBodyTypes: string[];
  imagePath: File | null;
  installationVideo: File | null;
  warrantyMonths: string;
};

export type AccessoryManagerState = {
  accessories: AccessoriesListItem[];
  bodyTypeOptions: MultiComboboxOption[];
  brands: BrandAccessoryResponse[];
  carBrandOptions: MultiComboboxOption[];
  categories: CategoryResponse[];
  categoryOptions: MultiComboboxOption[];
  deleteConfirmItem: AccessoriesListItem | null;
  editingAccessory: AccessoryDetailResponse | null;
  error: Error | null;
  form: UseFormReturn<AccessoryFormValues>;
  isBodyTypeLoading: boolean;
  isCarBrandLoading: boolean;
  isCategoryLoading: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  modalOpen: boolean;
  page: number;
  pageSize: number;
  selectedBrand: string;
  selectedCategories: string[];
  sortOption: string;
  totalPages: number;
  closeModal: () => void;
  confirmDelete: () => void;
  handleDelete: (item: AccessoriesListItem) => void;
  openCreate: () => void;
  openEdit: (item: AccessoriesListItem) => void;
  setDeleteConfirmItem: (item: AccessoriesListItem | null) => void;
  setPage: (page: number) => void;
  setSelectedBrand: (value: string) => void;
  setSelectedCategories: (value: string[]) => void;
  setSortOption: (value: string) => void;
  submitForm: () => void;
};

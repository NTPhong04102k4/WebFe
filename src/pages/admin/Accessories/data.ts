import type { UseFormReturn } from "react-hook-form";

import type { ComboTreeItem, MultiComboboxOption } from "src/components/core";
import type {
  AccessoriesListItem,
  AccessoryDetailResponse,
} from "src/shared/types/Reponse/accessories/accessory";
import type { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import type { CategoryResponse } from "src/shared/types/Reponse/category";

export const ACCESSORY_SORT_OPTIONS = [
  { label: "Ten phu kien", value: "accessoryName" },
  { label: "Gia ban", value: "price" },
  { label: "Ton kho", value: "stockQuantity" },
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
  categoryTreeItems: ComboTreeItem[];
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
  search: string;
  selectedBrand: string;
  selectedCategory: string;
  sortBy: string;
  sortDescending: boolean;
  totalPages: number;
  closeModal: () => void;
  confirmDelete: () => void;
  handleDelete: (item: AccessoriesListItem) => void;
  openCreate: () => void;
  openEdit: (item: AccessoriesListItem) => void;
  setDeleteConfirmItem: (item: AccessoriesListItem | null) => void;
  setPage: (page: number) => void;
  setSearch: (value: string) => void;
  setSelectedBrand: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSortBy: (value: string) => void;
  setSortDescending: (value: boolean) => void;
  submitForm: () => void;
};

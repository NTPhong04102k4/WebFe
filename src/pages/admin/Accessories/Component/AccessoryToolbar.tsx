import { Plus } from "lucide-react";

import { HoverInfo, MultiCombobox, type MultiComboboxOption, Select } from "src/components/core";
import { ACCESSORY_SORT_OPTIONS } from "../data";

type AccessoryToolbarProps = {
  brandOptions: { label: string; value: string }[];
  categoryOptions: MultiComboboxOption[];
  isCategoryLoading?: boolean;
  isSyncing: boolean;
  selectedBrand: string;
  selectedCategories: string[];
  sortOption: string;
  onCreate: () => void;
  onSelectedBrandChange: (value: string) => void;
  onSelectedCategoriesChange: (value: string[]) => void;
  onSortOptionChange: (value: string) => void;
};

export function AccessoryToolbar({
  brandOptions,
  categoryOptions,
  isCategoryLoading,
  isSyncing,
  selectedBrand,
  selectedCategories,
  sortOption,
  onCreate,
  onSelectedBrandChange,
  onSelectedCategoriesChange,
  onSortOptionChange,
}: AccessoryToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý phụ kiện</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Quản lý danh sách phụ kiện, giá bán, tồn kho và nhóm phân loại.
          </p>
        </div>
        <HoverInfo content="Tạo phụ kiện mới">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Tạo phụ kiện
          </button>
        </HoverInfo>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <MultiCombobox
          options={categoryOptions}
          value={selectedCategories}
          onChange={onSelectedCategoriesChange}
          loading={isCategoryLoading}
          placeholder="Tất cả danh mục"
        />
        <Select
          value={selectedBrand}
          onChange={(event) => onSelectedBrandChange(event.target.value)}
          placeholder="Tất cả thương hiệu"
          options={brandOptions}
        />
        <Select
          value={sortOption}
          onChange={(event) => onSortOptionChange(event.target.value)}
          options={[...ACCESSORY_SORT_OPTIONS]}
        />
        <div className="flex items-center gap-3">
          {isSyncing ? <span className="text-xs text-slate-600 dark:text-slate-300">Đang đồng bộ...</span> : null}
        </div>
      </div>
    </div>
  );
}

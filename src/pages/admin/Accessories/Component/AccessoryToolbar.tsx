import { Plus } from "lucide-react";

import { Checkbox, HoverInfo, Input, Select } from "src/components/core";
import { ACCESSORY_SORT_OPTIONS } from "../data";

type AccessoryToolbarProps = {
  brandOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  isSyncing: boolean;
  search: string;
  selectedBrand: string;
  selectedCategory: string;
  sortBy: string;
  sortDescending: boolean;
  onCreate: () => void;
  onSearchChange: (value: string) => void;
  onSelectedBrandChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortDescendingChange: (value: boolean) => void;
};

export function AccessoryToolbar({
  brandOptions,
  categoryOptions,
  isSyncing,
  search,
  selectedBrand,
  selectedCategory,
  sortBy,
  sortDescending,
  onCreate,
  onSearchChange,
  onSelectedBrandChange,
  onSelectedCategoryChange,
  onSortByChange,
  onSortDescendingChange,
}: AccessoryToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quan ly phu kien</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Quan ly danh sach phu kien, gia ban, ton kho va nhom phan loai.
          </p>
        </div>
        <HoverInfo content="Tao phu kien moi">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Tao phu kien
          </button>
        </HoverInfo>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tim theo ten, hang, danh muc..."
        />
        <Select
          value={selectedCategory}
          onChange={(event) => onSelectedCategoryChange(event.target.value)}
          placeholder="Tat ca danh muc"
          options={categoryOptions}
        />
        <Select
          value={selectedBrand}
          onChange={(event) => onSelectedBrandChange(event.target.value)}
          placeholder="Tat ca thuong hieu"
          options={brandOptions}
        />
        <Select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          options={[...ACCESSORY_SORT_OPTIONS]}
        />
        <div className="flex items-center gap-3">
          <Checkbox
            checked={sortDescending}
            onChange={(event) => onSortDescendingChange(event.target.checked)}
            label="Giam dan"
          />
          {isSyncing ? <span className="text-xs text-slate-600 dark:text-slate-300">Dang dong bo...</span> : null}
        </div>
      </div>
    </div>
  );
}

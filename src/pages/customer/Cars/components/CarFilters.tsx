import { Input } from "@/components/core/Form/Input";
import { Select } from "@/components/core/Select/Select";
import type { SelectOption } from "@/components/core/Select/Select";
import { MultiCombobox } from "@/components/core/MultiCombobox/MultiCombobox";
import type { MultiComboboxOption } from "@/components/core/MultiCombobox/MultiCombobox";

const CONDITION_OPTIONS: SelectOption[] = [
  { value: "new", label: "Xe mới nguyên" },
  { value: "used", label: "Xe đã sử dụng" },
  { value: "certified", label: "Xe đã sử dụng (chứng thực)" },
];

interface CarFiltersProps {
  search: string;
  brandCode: string;
  bodyCode: string;
  condition: string;
  statusCodes: string[];
  priceFrom: string;
  priceTo: string;
  brandOptions: SelectOption[];
  bodyOptions: SelectOption[];
  statusOptions: MultiComboboxOption[];
  brandsLoading: boolean;
  bodiesLoading: boolean;
  onSearchChange: (v: string) => void;
  onBrandCodeChange: (v: string) => void;
  onBodyCodeChange: (v: string) => void;
  onConditionChange: (v: string) => void;
  onStatusCodesChange: (v: string[]) => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onReset: () => void;
}

export function CarFilters({
  search,
  brandCode,
  bodyCode,
  condition,
  statusCodes,
  priceFrom,
  priceTo,
  brandOptions,
  bodyOptions,
  statusOptions,
  brandsLoading,
  bodiesLoading,
  onSearchChange,
  onBrandCodeChange,
  onBodyCodeChange,
  onConditionChange,
  onStatusCodesChange,
  onPriceFromChange,
  onPriceToChange,
  onReset,
}: CarFiltersProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          label="Tên xe"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="VD: Camry"
        />
        <Select
          label="Hãng xe"
          value={brandCode}
          options={brandOptions}
          placeholder="Tất cả"
          disabled={brandsLoading}
          onChange={(e) => onBrandCodeChange(e.target.value)}
        />
        <Select
          label="Kiểu thân xe"
          value={bodyCode}
          options={bodyOptions}
          placeholder="Tất cả"
          disabled={bodiesLoading}
          onChange={(e) => onBodyCodeChange(e.target.value)}
        />
        <Select
          label="Tình trạng xe"
          value={condition}
          options={CONDITION_OPTIONS}
          placeholder="Tất cả"
          onChange={(e) => onConditionChange(e.target.value)}
        />
        <MultiCombobox
          label="Trạng thái xe"
          options={statusOptions}
          value={statusCodes}
          onChange={onStatusCodesChange}
          placeholder="Tất cả trạng thái"
        />

        <Input
          label="Giá từ"
          inputMode="numeric"
          value={priceFrom}
          onChange={(e) => onPriceFromChange(e.target.value)}
          placeholder="VD: 100000000"
        />
        <Input
          label="Giá đến"
          inputMode="numeric"
          value={priceTo}
          onChange={(e) => onPriceToChange(e.target.value)}
          placeholder="VD: 200000000"
        />
      </div>
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={onReset}
        >
          Xoá bộ lọc
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { useCarStatusList } from "src/query/car/useCarQueries";
import { SelectField } from "src/shared/components/Form/SelectField";
import { ComboBox } from "src/components/common/ComboBox";

export interface CarFiltersValue {
  conditions: string[];
  statusCodes: string[];
  search: string;
  brandCode: string;
  bodyCode: string;
  page: number;
  pageSize: number;
}

const CONDITION_OPTIONS = [
  { value: "new", label: "Xe mới" },
  { value: "used", label: "Xe đã sử dụng" },
  { value: "certified", label: "Xe chứng thực" },
];

export const CarFilters: React.FC<{
  value: CarFiltersValue;
  onChange: (next: Partial<CarFiltersValue>) => void;
}> = ({ value, onChange }) => {
  const { data: brandCar = [], isLoading: brandsLoading } = useBrandCarList();
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList();
  const { data: statuses = [] } = useCarStatusList();

  const statusOptions = statuses
    .filter((s) => s.isActive)
    .map((s) => ({ value: s.statusCode, label: s.statusName }));

  return (
    <div className="rounded-md border bg-gray-50 p-4 space-y-3">
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Tên xe</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={value.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="VD: Camry"
            />
          </label>
        </div>
        <div className="flex-1">
          <SelectField
            label="Hãng xe"
            value={value.brandCode}
            onChange={(e) => onChange({ brandCode: e.target.value })}
            disabled={brandsLoading}
            options={brandCar.map((brand) => ({
              value: brand.brandCode,
              label: brand.brandName,
            }))}
          />
        </div>
        <div className="flex-1">
          <SelectField
            label="Kiểu thân xe"
            value={value.bodyCode}
            onChange={(e) => onChange({ bodyCode: e.target.value })}
            disabled={bodiesLoading}
            options={bodyTypes.map((body) => ({
              value: body.bodyCode,
              label: body.bodyName,
            }))}
          />
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <ComboBox
            label="Tình trạng xe"
            placeholder="Chọn tình trạng..."
            value={value.conditions}
            valueCollection={CONDITION_OPTIONS}
            onChange={(conditions) => onChange({ conditions })}
          />
        </div>
        <div className="flex-1">
          <ComboBox
            label="Trạng thái giao dịch"
            placeholder="Chọn trạng thái..."
            value={value.statusCodes}
            valueCollection={statusOptions}
            onChange={(statusCodes) => onChange({ statusCodes })}
          />
        </div>
        <div className="flex-1 hidden md:block" />
      </div>
    </div>
  );
};

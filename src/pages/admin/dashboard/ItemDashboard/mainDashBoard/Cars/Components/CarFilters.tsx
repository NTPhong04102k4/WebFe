import React from "react";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { SelectField } from "src/shared/components/Form/SelectField";

type Condition = "new" | "used" | "certified" | "";

export interface CarFiltersValue {
  condition: Condition;
  search: string;
  brandCode: string;
  bodyCode: string;
  page: number;
  pageSize: number;
}

export const CarFilters: React.FC<{
  value: CarFiltersValue;
  onChange: (next: Partial<CarFiltersValue>) => void;
}> = ({ value, onChange }) => {
  const { data: brandCar = [], isLoading: brandsLoading } = useBrandCarList();
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList();

  return (
    <div className="rounded-md border bg-gray-50 p-4">
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
            label="Tình trạng"
            value={value.condition}
            options={[
              { value: "new", label: "Xe mới" },
              { value: "used", label: "Xe cũ" },
              { value: "certified", label: "Xe cũ đã chứng nhận" },
            ]}
            onChange={(e) =>
              onChange({ condition: e.target.value as Condition })
            }
          />
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
    </div>
  );
};

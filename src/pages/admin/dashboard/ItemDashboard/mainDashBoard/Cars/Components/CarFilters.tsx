import React from "react";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";

type Condition = "new" | "used" | "certified" | "";

export interface CarFiltersValue {
  condition: Condition;
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
    <div className="bg-gray-50 border rounded-md p-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Tình trạng</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={value.condition}
            onChange={(e) =>
              onChange({ condition: e.target.value as Condition })
            }
          >
            <option value="">Tất cả</option>
            <option value="new">Xe mới</option>
            <option value="used">Xe cũ</option>
            <option value="certified">Xe cũ đã chứng nhận</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Hãng xe</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={value.brandCode}
            onChange={(e) => onChange({ brandCode: e.target.value })}
            disabled={brandsLoading}
          >
            <option value="">Tất cả</option>
            {brandCar.map((b) => (
              <option key={b.brandCode} value={b.brandCode}>
                {b.brandName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Dòng xe (Body)
          </label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={value.bodyCode}
            onChange={(e) => onChange({ bodyCode: e.target.value })}
            disabled={bodiesLoading}
          >
            <option value="">Tất cả</option>
            {bodyTypes.map((t) => (
              <option key={t.bodyCode} value={t.bodyCode}>
                {t.bodyName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

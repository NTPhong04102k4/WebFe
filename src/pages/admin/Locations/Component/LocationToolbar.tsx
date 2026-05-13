import { Input, Select } from "src/components/core";

import { LOCATION_TYPE_OPTIONS } from "../data";

type LocationToolbarProps = {
  isSyncing: boolean;
  search: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
};

export function LocationToolbar({
  isSyncing,
  search,
  selectedType,
  onSearchChange,
  onTypeChange,
}: LocationToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quan ly dia diem</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Danh sach chi nhanh, xuong dich vu va kho dang duoc backend cung cap.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,360px)_220px_auto] md:items-center">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tim theo ma, ten, dia chi, quan ly..."
        />
        <Select
          value={selectedType}
          onChange={(event) => onTypeChange(event.target.value)}
          options={[...LOCATION_TYPE_OPTIONS]}
        />
        {isSyncing ? <span className="text-xs text-slate-600 dark:text-slate-300">Dang dong bo...</span> : null}
      </div>
    </div>
  );
}

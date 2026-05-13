import { Plus } from "lucide-react";

import { HoverInfo, Input } from "src/components/core";

type CategoryToolbarProps = {
  isSyncing: boolean;
  search: string;
  onCreate: () => void;
  onSearchChange: (value: string) => void;
};

export function CategoryToolbar({ isSyncing, search, onCreate, onSearchChange }: CategoryToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quan ly danh muc</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Danh muc dung cho phu kien va cac nhom dich vu lien quan.
          </p>
        </div>
        <HoverInfo content="Tao danh muc moi">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Tao danh muc
          </button>
        </HoverInfo>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tim theo ten, mo ta, ID..."
        />
        {isSyncing ? <span className="text-xs text-slate-600 dark:text-slate-300">Dang dong bo...</span> : null}
      </div>
    </div>
  );
}

import { Input } from "src/components/core";

type BodyTypeToolbarProps = {
  search: string;
  isSyncing: boolean;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export function BodyTypeToolbar({ search, isSyncing, onSearchChange, onCreate }: BodyTypeToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quan ly kieu than xe</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Danh muc body type dung cho bo loc va form xe
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900"
          onClick={onCreate}
        >
          + Tao kieu than
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tim theo ma, ten, so ghe..."
        />
        {isSyncing ? <span className="text-xs text-slate-600 dark:text-slate-300">Dang dong bo...</span> : null}
      </div>
    </div>
  );
}

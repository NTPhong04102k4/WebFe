export type DateTimeRangeValue = {
  fromDate: string;
  toDate: string;
};

type DateTimePickerProps = {
  label?: string;
  value: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
  className?: string;
  type?: "date" | "datetime-local";
  /** Hiển thị label và 2 ô ngày trên cùng 1 hàng thay vì xuống dòng */
  inline?: boolean;
};

export function DateTimePicker({
  label = "Khoang ngay",
  value,
  onChange,
  className = "",
  type = "datetime-local",
  inline = false,
}: DateTimePickerProps) {
  const inputClassName =
    "rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-300 dark:focus:ring-blue-300/30";

  if (inline) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        <input
          type={type}
          value={value.fromDate}
          onChange={(event) => onChange({ ...value, fromDate: event.target.value })}
          className={inputClassName}
        />
        <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
        <input
          type={type}
          value={value.toDate}
          onChange={(event) => onChange({ ...value, toDate: event.target.value })}
          className={inputClassName}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tu ngay
          </span>
          <input
            type={type}
            value={value.fromDate}
            onChange={(event) => onChange({ ...value, fromDate: event.target.value })}
            className={`w-full ${inputClassName}`}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Den ngay
          </span>
          <input
            type={type}
            value={value.toDate}
            onChange={(event) => onChange({ ...value, toDate: event.target.value })}
            className={`w-full ${inputClassName}`}
          />
        </label>
      </div>
    </div>
  );
}

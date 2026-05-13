import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

type ComboBoxOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type ComboBoxProps = {
  label?: string;
  placeholder?: string;
  value: string[];
  valueCollection: ComboBoxOption[];
  onChange: (value: string[]) => void;
  className?: string;
};

export function ComboBox({
  label,
  placeholder = "Chon gia tri",
  value,
  valueCollection,
  onChange,
  className = "",
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const selectedOptions = useMemo(
    () => valueCollection.filter((option) => value.includes(option.value)),
    [value, valueCollection]
  );

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  const clearValue = () => onChange([]);

  return (
    <div className={`relative space-y-1 ${className}`}>
      {label ? (
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </label>
      ) : null}

      <button
        type="button"
        className="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-left text-sm text-slate-800 outline-none transition hover:bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:border-blue-300 dark:focus:ring-blue-300/30"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                <span className="truncate">{option.label}</span>
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-500" />
      </button>

      {selectedOptions.length > 0 ? (
        <button
          type="button"
          className="absolute right-9 top-8 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          onClick={clearValue}
          aria-label="Xoa lua chon"
          title="Xoa lua chon"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {open ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-300 bg-white p-1 shadow-lg dark:border-slate-600 dark:bg-slate-900">
          {valueCollection.map((option) => {
            const selected = value.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => toggleValue(option.value)}
              >
                <span>{option.label}</span>
                {selected ? <Check className="h-4 w-4 text-blue-600 dark:text-blue-300" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

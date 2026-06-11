import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  /** Ẩn option mặc định (placeholder) - dùng khi luôn cần chọn 1 giá trị cụ thể */
  hidePlaceholder?: boolean;
};

export function SelectField({
  label,
  options,
  placeholder = "Tất cả",
  hidePlaceholder = false,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        {...props}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 ${className}`}
      >
        {!hidePlaceholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

import React from "react";

import { cn } from "../utils";

export type SelectOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, id, className, required, ...props }, ref) => {
    const selectId = id ?? React.useId();

    return (
      <div className="space-y-1">
        {label ? (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            {label}
            {required ? <span className="ml-1 text-red-500 dark:text-red-400">*</span> : null}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-300 dark:focus:ring-blue-300/30 dark:disabled:bg-slate-800",
            Boolean(error) && "border-red-500 focus:border-red-500 focus:ring-red-500/25 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/30",
            className
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
        {!error && helperText ? <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";

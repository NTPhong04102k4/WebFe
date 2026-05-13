import React from "react";

import { cn } from "../utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-invalid={Boolean(error)}
            className={cn(
              "h-4 w-4 rounded border-2 border-slate-400 text-blue-600 focus:ring-2 focus:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:bg-slate-900 dark:text-blue-300 dark:focus:ring-blue-300/30",
              className
            )}
            {...props}
          />
          {label ? <span>{label}</span> : null}
        </label>
        {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

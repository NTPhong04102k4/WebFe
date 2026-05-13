import React from "react";

import { cn } from "../utils";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            aria-invalid={Boolean(error)}
            className={cn(
              "h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800",
              className
            )}
            {...props}
          />
          {label ? <span>{label}</span> : null}
        </label>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }
);

Radio.displayName = "Radio";

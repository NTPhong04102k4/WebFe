import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";

import { cn } from "../utils";

export type MultiComboboxOption = {
  value: string;
  label: string;
};

export type MultiComboboxProps = {
  options: MultiComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Cho phép thêm giá trị tự do không có trong `options` (chip/tag input). */
  allowCreate?: boolean;
};

export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  label,
  loading = false,
  disabled = false,
  className,
  allowCreate = false,
}: MultiComboboxProps) {
  const triggerId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(() => {
    const matched = options.filter((option) => value.includes(option.value));
    if (!allowCreate) return matched;
    const matchedValues = new Set(matched.map((option) => option.value));
    const custom = value
      .filter((item) => !matchedValues.has(item))
      .map((item) => ({ value: item, label: item }));
    return [...matched, ...custom];
  }, [options, value, allowCreate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, search]);

  const trimmedSearch = search.trim();
  const canCreate =
    allowCreate &&
    trimmedSearch.length > 0 &&
    !value.some((item) => item.toLowerCase() === trimmedSearch.toLowerCase()) &&
    !options.some((option) => option.value.toLowerCase() === trimmedSearch.toLowerCase());

  const addCustomValue = () => {
    if (!canCreate) return;
    onChange([...value, trimmedSearch]);
    setSearch("");
  };

  const openDropdown = () => {
    if (disabled || loading) return;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeDropdown = () => {
    setOpen(false);
    setSearch("");
  };

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeValue = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative space-y-1", className)}>
      {label && (
        <label
          htmlFor={triggerId}
          className="block text-sm font-medium text-slate-800 dark:text-slate-100"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        id={triggerId}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-lg border-2 border-slate-400 bg-white px-3 py-1.5 text-sm outline-none transition",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25",
          "dark:border-slate-500 dark:bg-slate-900",
          "dark:focus:border-blue-300 dark:focus:ring-blue-300/30",
          open &&
            "border-blue-600 ring-2 ring-blue-600/25 dark:border-blue-300 dark:ring-blue-300/30",
          disabled && "cursor-not-allowed opacity-60",
          !disabled && "cursor-pointer",
        )}
        onClick={openDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            openDropdown();
          }
        }}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
            >
              {option.label}
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Bỏ chọn ${option.label}`}
                className="rounded p-0.5 hover:text-red-600 dark:hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  removeValue(option.value);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : !open ? (
          <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
        ) : null}

        {open && (
          <input
            ref={inputRef}
            aria-autocomplete="list"
            aria-controls={listboxId}
            className="min-w-[80px] flex-1 bg-transparent outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                addCustomValue();
              }
            }}
          />
        )}

        {loading && (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-slate-400" />
        )}

        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border-2 border-slate-300 bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-900"
        >
          {loading ? (
            <li className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </li>
          ) : (
            <>
              {canCreate && (
                <li role="none">
                  <div
                    role="option"
                    aria-selected={false}
                    tabIndex={-1}
                    className="mx-1 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    onClick={addCustomValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        addCustomValue();
                      }
                    }}
                  >
                    + Thêm "{trimmedSearch}"
                  </div>
                </li>
              )}
              {filtered.length === 0 && !canCreate && (
                <li className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  Không tìm thấy kết quả
                </li>
              )}
            </>
          )}
          {!loading &&
            filtered.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <li key={option.value} role="none">
                  <div
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    className={cn(
                      "mx-1 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    )}
                    onClick={() => toggleValue(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleValue(option.value);
                      }
                    }}
                  >
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1 truncate">{option.label}</span>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

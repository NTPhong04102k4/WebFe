import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, ChevronRight, Loader2, X } from "lucide-react";

import { cn } from "../utils";

export type ComboTreeItem = {
  id: string;
  label: string;
  children?: ComboTreeItem[];
  meta?: Record<string, unknown>;
};

export type ComboTreeBoxProps = {
  items: ComboTreeItem[];
  value?: string;
  onChange?: (id: string, item: ComboTreeItem) => void;
  onClear?: () => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

// ── helpers ────────────────────────────────────────────────────────────────

function findItem(items: ComboTreeItem[], id: string): ComboTreeItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
}

function filterTree(items: ComboTreeItem[], query: string): ComboTreeItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.flatMap((item) => {
    const selfMatch = item.label.toLowerCase().includes(q);
    const filteredChildren = item.children
      ? filterTree(item.children, q)
      : undefined;
    if (selfMatch) return [{ ...item }];
    if (filteredChildren?.length) return [{ ...item, children: filteredChildren }];
    return [];
  });
}

function collectExpandableIds(items: ComboTreeItem[], into: Set<string>) {
  for (const item of items) {
    if (item.children?.length) {
      into.add(item.id);
      collectExpandableIds(item.children, into);
    }
  }
}

// ── TreeNode ───────────────────────────────────────────────────────────────

type TreeNodeProps = {
  item: ComboTreeItem;
  depth: number;
  value?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (item: ComboTreeItem) => void;
};

function TreeNode({ item, depth, value, expanded, onToggle, onSelect }: TreeNodeProps) {
  const hasChildren = Boolean(item.children?.length);
  const isOpen = expanded.has(item.id);
  const isSelected = value === item.id;

  return (
    <li role="none">
      <div
        role="option"
        aria-selected={isSelected}
        tabIndex={-1}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        className={cn(
          "flex select-none items-center gap-1.5 rounded-md py-1.5 pr-3 text-sm transition-colors",
          hasChildren
            ? "cursor-default text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
            : cn(
                "cursor-pointer",
                isSelected
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                  : "text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
              ),
        )}
        onClick={() => {
          if (hasChildren) {
            onToggle(item.id);
          } else {
            onSelect(item);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (hasChildren) {
              onToggle(item.id);
            } else {
              onSelect(item);
            }
          }
        }}
      >
        <span className="flex w-4 flex-shrink-0 items-center justify-center">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            )
          ) : null}
        </span>
        <span className={cn("flex-1 truncate", hasChildren && "font-medium")}>
          {item.label}
        </span>
        {isSelected && (
          <Check className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      {hasChildren && isOpen && (
        <ul role="group" className="mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              value={value}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── ComboTreeBox ───────────────────────────────────────────────────────────

export function ComboTreeBox({
  items,
  value,
  onChange,
  onClear,
  placeholder = "Chọn...",
  label,
  loading = false,
  disabled = false,
  className,
}: ComboTreeBoxProps) {
  const triggerId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => (value ? findItem(items, value) : undefined),
    [items, value],
  );

  const filtered = useMemo(() => filterTree(items, search), [items, search]);

  // Auto-expand all branches when searching
  useEffect(() => {
    if (!search.trim()) return;
    const ids = new Set<string>();
    collectExpandableIds(filtered, ids);
    setExpanded(ids);
  }, [search, filtered]);

  const openDropdown = () => {
    if (disabled || loading) return;
    setOpen(true);
    setSearch("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  const handleSelect = useCallback(
    (item: ComboTreeItem) => {
      onChange?.(item.id, item);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeDropdown]);

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
          "flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border-2 border-slate-400 bg-white px-3 py-1.5 text-sm outline-none transition",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25",
          "dark:border-slate-500 dark:bg-slate-900",
          "dark:focus:border-blue-300 dark:focus:ring-blue-300/30",
          open &&
            "border-blue-600 ring-2 ring-blue-600/25 dark:border-blue-300 dark:ring-blue-300/30",
          disabled && "cursor-not-allowed opacity-60",
        )}
        onClick={openDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            openDropdown();
          }
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            aria-autocomplete="list"
            aria-controls={listboxId}
            className="flex-1 bg-transparent outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={cn(
              "flex-1 truncate",
              !selectedItem && "text-slate-500 dark:text-slate-400",
            )}
          >
            {selectedItem?.label ?? placeholder}
          </span>
        )}

        {loading && (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-slate-400" />
        )}

        {!loading && value && onClear && !open && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Xóa lựa chọn"
            className="flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200",
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
          ) : filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy kết quả
            </li>
          ) : (
            filtered.map((item) => (
              <TreeNode
                key={item.id}
                item={item}
                depth={0}
                value={value}
                expanded={expanded}
                onToggle={handleToggle}
                onSelect={handleSelect}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}

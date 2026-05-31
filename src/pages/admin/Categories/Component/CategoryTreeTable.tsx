import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Edit } from "lucide-react";

import { HoverInfo } from "src/components/core";
import { cn } from "src/components/core/utils";
import type { CategoryResponse } from "src/shared/types/Reponse/category";

// ── tree builder ────────────────────────────────────────────────────────────

type TreeNode = CategoryResponse & {
  children: TreeNode[];
  depth: number;
};

function buildTree(categories: CategoryResponse[]): TreeNode[] {
  const sorted = [...categories].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const nodeMap = new Map<number, TreeNode>();
  for (const cat of sorted) {
    nodeMap.set(cat.categoryID, { ...cat, children: [], depth: 0 });
  }

  const roots: TreeNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentCategoryID != null && nodeMap.has(node.parentCategoryID)) {
      const parent = nodeMap.get(node.parentCategoryID)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function flattenVisible(nodes: TreeNode[], expanded: Set<number>): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0 && expanded.has(node.categoryID)) {
      result.push(...flattenVisible(node.children, expanded));
    }
  }
  return result;
}

// ── component ───────────────────────────────────────────────────────────────

type CategoryTreeTableProps = {
  categories: CategoryResponse[];
  onEdit: (category: CategoryResponse) => void;
};

export function CategoryTreeTable({ categories, onEdit }: CategoryTreeTableProps) {
  const tree = useMemo(() => buildTree(categories), [categories]);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Expand root nodes once data arrives
  useEffect(() => {
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      return new Set(tree.filter((n) => n.children.length > 0).map((n) => n.categoryID));
    });
  }, [tree]);

  const visibleRows = useMemo(() => flattenVisible(tree, expanded), [tree, expanded]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (categories.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1.5fr_72px_72px_64px] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
        {["Danh mục", "Mô tả", "Thứ tự", "Trạng thái", "Hành động"].map((h, i) => (
          <div
            key={h}
            className={cn(
              "text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
              i >= 2 && "text-center",
              i === 4 && "text-right",
            )}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {visibleRows.map((node) => {
          const hasChildren = node.children.length > 0;
          const isExpanded = expanded.has(node.categoryID);

          return (
            <div
              key={node.categoryID}
              className={cn(
                "grid grid-cols-[1fr_1.5fr_72px_72px_64px] items-center border-b border-slate-100 px-4 py-2.5 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40",
                node.depth > 0 && "bg-slate-50/60 dark:bg-slate-900/60",
              )}
            >
              {/* Name + chevron */}
              <div
                className="flex min-w-0 items-center gap-1"
                style={{ paddingLeft: `${node.depth * 20}px` }}
              >
                <button
                  type="button"
                  tabIndex={hasChildren ? 0 : -1}
                  aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors",
                    hasChildren
                      ? "text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      : "pointer-events-none opacity-0",
                  )}
                  onClick={() => hasChildren && toggle(node.categoryID)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div
                    className={cn(
                      "truncate text-sm text-slate-800 dark:text-slate-100",
                      node.depth === 0 ? "font-semibold" : "font-normal",
                    )}
                  >
                    {node.categoryName}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    ID {node.categoryID}
                    {hasChildren && (
                      <span className="ml-1.5 text-blue-500 dark:text-blue-400">
                        · {node.children.length} con
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="truncate text-sm text-slate-600 dark:text-slate-300">
                {node.description || <span className="text-slate-400 dark:text-slate-600">—</span>}
              </div>

              {/* Display order */}
              <div className="text-center text-sm tabular-nums text-slate-700 dark:text-slate-300">
                {node.displayOrder ?? 0}
              </div>

              {/* Status */}
              <div className="flex justify-center">
                {node.isActive ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Bật
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    Tắt
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <HoverInfo content="Chỉnh sửa danh mục">
                  <button
                    type="button"
                    aria-label="Chỉnh sửa danh mục"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-400 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    onClick={() => onEdit(node)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </HoverInfo>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

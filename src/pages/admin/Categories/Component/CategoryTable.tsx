import { useMemo } from "react";
import { Edit } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, HoverInfo } from "src/components/core";
import type { CategoryResponse } from "src/shared/types/Reponse/category";

type CategoryTableProps = {
  categories: CategoryResponse[];
  onEdit: (category: CategoryResponse) => void;
  onReorder: (categories: CategoryResponse[]) => void;
};

export function CategoryTable({ categories, onEdit, onReorder }: CategoryTableProps) {
  const columns = useMemo<ColumnDef<CategoryResponse>[]>(
    () => [
      {
        accessorKey: "categoryName",
        header: "Danh muc",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.original.categoryName}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">ID: {row.original.categoryID}</div>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Mo ta",
        cell: ({ getValue }) => <span className="block max-w-md truncate">{String(getValue() || "-")}</span>,
      },
      {
        accessorKey: "parentCategoryID",
        header: "Danh muc cha",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "displayOrder",
        header: "Thu tu",
        cell: ({ getValue }) => String(getValue() ?? 0),
      },
      {
        accessorKey: "isActive",
        header: "Trang thai",
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-200">
              Dang bat
            </span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Tam tat
            </span>
          ),
      },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <HoverInfo content="Chinh sua danh muc">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-400 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onEdit(row.original)}
                aria-label="Chinh sua danh muc"
              >
                <Edit className="h-4 w-4" />
              </button>
            </HoverInfo>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      data={categories}
      columns={columns}
      getRowId={(category) => String(category.categoryID)}
      onRowOrderChange={onReorder}
      emptyTitle="Khong co danh muc"
      emptyDescription="Chua co danh muc phu hop voi bo loc."
    />
  );
}

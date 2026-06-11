import { useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, HoverInfo } from "src/components/core";
import type { AccessoriesListItem } from "src/shared/types/Reponse/accessories/accessory";

type AccessoryTableProps = {
  accessories: AccessoriesListItem[];
  onEdit: (item: AccessoriesListItem) => void;
  onDelete: (item: AccessoriesListItem) => void;
};

const formatCurrency = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";

  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export function AccessoryTable({ accessories, onEdit, onDelete }: AccessoryTableProps) {
  const columns = useMemo<ColumnDef<AccessoriesListItem>[]>(
    () => [
      {
        accessorKey: "accessoryName",
        header: "Phụ kiện",
        cell: ({ row }) => {
          const item = row.original;

          return (
            <div className="flex min-w-[260px] items-center gap-3">
              <div className="h-14 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                {item.imagePath ? (
                  <img className="h-full w-full object-cover" src={item.imagePath} alt={item.accessoryName} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.accessoryName}
                </div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-300">{item.brandName || "-"}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "categoryName",
        header: "Danh mục",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "price",
        header: "Giá bán",
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: "costPrice",
        header: "Giá vốn",
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: "stockQuantity",
        header: "Tồn kho",
        cell: ({ getValue }) => String(getValue() ?? 0),
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <HoverInfo content="Chỉnh sửa phụ kiện">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-400 bg-white text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onEdit(row.original)}
                aria-label="Chỉnh sửa phụ kiện"
              >
                <Edit className="h-4 w-4" />
              </button>
            </HoverInfo>
            <HoverInfo content="Xóa phụ kiện">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-red-400 bg-white text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400/30 dark:border-red-500 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-slate-800"
                onClick={() => onDelete(row.original)}
                aria-label="Xóa phụ kiện"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </HoverInfo>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      data={accessories}
      columns={columns}
      getRowId={(item) => String(item.accessoryID)}
      emptyTitle="Không có phụ kiện"
      emptyDescription="Chưa có phụ kiện phù hợp với bộ lọc."
    />
  );
}

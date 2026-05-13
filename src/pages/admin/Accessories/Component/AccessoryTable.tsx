import { useMemo } from "react";
import { Edit } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, HoverInfo } from "src/components/core";
import type { AccessoriesListItem } from "src/shared/types/Reponse/accessories/accessory";

type AccessoryTableProps = {
  accessories: AccessoriesListItem[];
  onEdit: (item: AccessoriesListItem) => void;
};

const formatCurrency = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";

  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export function AccessoryTable({ accessories, onEdit }: AccessoryTableProps) {
  const columns = useMemo<ColumnDef<AccessoriesListItem>[]>(
    () => [
      {
        accessorKey: "accessoryName",
        header: "Phu kien",
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
        header: "Danh muc",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "price",
        header: "Gia ban",
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: "costPrice",
        header: "Gia von",
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: "stockQuantity",
        header: "Ton kho",
        cell: ({ getValue }) => String(getValue() ?? 0),
      },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <HoverInfo content="Chinh sua phu kien">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-400 bg-white text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onEdit(row.original)}
                aria-label="Chinh sua phu kien"
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
      data={accessories}
      columns={columns}
      getRowId={(item) => String(item.accessoryID)}
      emptyTitle="Khong co phu kien"
      emptyDescription="Chua co phu kien phu hop voi bo loc."
    />
  );
}

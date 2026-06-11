import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core";
import type { BrandCarResponse } from "src/shared/types/Reponse/Car";

type BrandTableProps = {
  brands: BrandCarResponse[];
  onEdit: (brand: BrandCarResponse) => void;
};

export function BrandTable({ brands, onEdit }: BrandTableProps) {
  const columns = useMemo<ColumnDef<BrandCarResponse>[]>(
    () => [
      {
        accessorKey: "brandName",
        header: "Hãng",
        cell: ({ row }) => {
          const brand = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                {brand.logoPath ? (
                  <img className="h-full w-full object-contain" src={brand.logoPath} alt={brand.brandName} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{brand.brandName}</div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-300">Code: {brand.brandCode}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "countryOrigin",
        header: "Quốc gia",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ getValue }) => (
          <span className="block max-w-xs truncate">{String(getValue() || "-")}</span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-blue-300/30"
              onClick={() => onEdit(row.original)}
            >
              Sửa
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      data={brands}
      columns={columns}
      getRowId={(brand) => brand.brandCode}
      emptyTitle="Không có hãng xe"
      emptyDescription="Chưa có hãng xe phù hợp với bộ lọc."
    />
  );
}

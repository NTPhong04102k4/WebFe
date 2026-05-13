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
        header: "Hang",
        cell: ({ row }) => {
          const brand = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {brand.logoPath ? (
                  <img className="h-full w-full object-contain" src={brand.logoPath} alt={brand.brandName} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{brand.brandName}</div>
                <div className="truncate text-xs text-slate-600">Code: {brand.brandCode}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "countryOrigin",
        header: "Quoc gia",
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
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => onEdit(row.original)}
            >
              Sua
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
      emptyTitle="Khong co hang xe"
      emptyDescription="Chua co hang xe phu hop voi bo loc."
    />
  );
}

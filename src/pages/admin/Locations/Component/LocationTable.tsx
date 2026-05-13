import { useMemo } from "react";
import { Info } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, HoverInfo } from "src/components/core";
import type { LocationResponse } from "src/shared/types/Reponse/Location";

type LocationTableProps = {
  locations: LocationResponse[];
};

function formatTime(value: string | null | undefined) {
  if (!value) return "-";
  return value.slice(0, 5);
}

export function LocationTable({ locations }: LocationTableProps) {
  const columns = useMemo<ColumnDef<LocationResponse>[]>(
    () => [
      {
        accessorKey: "locationName",
        header: "Dia diem",
        cell: ({ row }) => {
          const location = row.original;

          return (
            <div className="min-w-[240px]">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {location.locationName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Code: {location.locationCode}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "locationType",
        header: "Loai",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {String(getValue() || "-")}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Dia chi",
        cell: ({ row }) => (
          <div className="max-w-md">
            <div className="truncate">{row.original.address || "-"}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {[row.original.city, row.original.province].filter(Boolean).join(", ") || "-"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Lien he",
        cell: ({ row }) => (
          <div>
            <div>{row.original.phone || "-"}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">{row.original.email || "-"}</div>
          </div>
        ),
      },
      {
        id: "time",
        header: "Gio mo cua",
        cell: ({ row }) => `${formatTime(row.original.openTime)} - ${formatTime(row.original.closeTime)}`,
      },
      {
        accessorKey: "managerName",
        header: "Quan ly",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        id: "info",
        header: "Toa do",
        enableSorting: false,
        cell: ({ row }) => {
          const { latitude, longitude, postalCode } = row.original;
          const content = (
            <div className="space-y-1">
              <div>Latitude: {latitude || "-"}</div>
              <div>Longitude: {longitude || "-"}</div>
              <div>Postal: {postalCode || "-"}</div>
            </div>
          );

          return (
            <HoverInfo content={content}>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-400 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Thong tin toa do"
              >
                <Info className="h-4 w-4" />
              </button>
            </HoverInfo>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      data={locations}
      columns={columns}
      getRowId={(location) => location.locationCode}
      emptyTitle="Khong co dia diem"
      emptyDescription="Chua co dia diem phu hop voi bo loc."
    />
  );
}

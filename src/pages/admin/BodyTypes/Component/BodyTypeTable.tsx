import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core";
import type { BodyCarReponse } from "src/shared/types/Reponse/Car";

type BodyTypeTableProps = {
  bodyTypes: BodyCarReponse[];
  onEdit: (bodyType: BodyCarReponse) => void;
};

export function BodyTypeTable({ bodyTypes, onEdit }: BodyTypeTableProps) {
  const columns = useMemo<ColumnDef<BodyCarReponse>[]>(
    () => [
      {
        accessorKey: "bodyName",
        header: "Kiểu thân",
        cell: ({ row }) => {
          const bodyType = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                {bodyType.imagePath ? (
                  <img className="h-full w-full object-cover" src={bodyType.imagePath} alt={bodyType.bodyName} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{bodyType.bodyName}</div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-300">Code: {bodyType.bodyCode}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "seatCapacityRange",
        header: "Số ghế",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "description",
        header: "Mô tả",
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
      data={bodyTypes}
      columns={columns}
      getRowId={(bodyType) => bodyType.bodyCode}
      emptyTitle="Không có kiểu thân xe"
      emptyDescription="Chưa có kiểu thân xe phù hợp với bộ lọc."
    />
  );
}

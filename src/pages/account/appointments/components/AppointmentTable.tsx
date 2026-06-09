import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core/Table/DataTable";
import type { AppointmentViewModel } from "src/services/api/functions/workshop/workshop.types";

type Props = {
  rows: AppointmentViewModel[];
  isLoading: boolean;
  onCancel: (id: number) => Promise<void>;
  isCancelling: boolean;
};

export function AppointmentTable({ rows, isLoading, onCancel, isCancelling }: Props) {
  const columns = useMemo<ColumnDef<AppointmentViewModel>[]>(
    () => [
      {
        accessorKey: "appointmentNumber",
        header: "Mã",
      },
      {
        accessorKey: "scheduledDateTime",
        header: "Thời gian",
        cell: ({ row }) => new Date(row.original.scheduledDateTime).toLocaleString("vi-VN"),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "customerNote",
        header: "Ghi chú",
        cell: ({ row }) => row.original.customerNote ?? "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const a = row.original;
          if (a.status === "Cancelled" || a.status === "Completed") return null;
          return (
            <button
              type="button"
              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-red-900/30 dark:text-red-400"
              onClick={() => onCancel(a.appointmentID)}
              disabled={isCancelling}
            >
              Hủy
            </button>
          );
        },
      },
    ],
    [onCancel, isCancelling]
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      loading={isLoading}
      emptyTitle="Chưa có lịch hẹn"
      emptyDescription="Đặt lịch mới để bắt đầu."
    />
  );
}

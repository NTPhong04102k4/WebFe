import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import { DataTable } from "src/components/core/Table/DataTable";
import { WorkflowStepper } from "@/components/common/WorkflowStepper";
import {
  APPOINTMENT_PROGRESS_STEPS,
  appointmentProgressCancelledLabel,
  appointmentProgressStepIndex,
} from "@/common/utils/appointmentProgress";
import type { AppointmentViewModel } from "src/services/api/functions/workshop/workshop.types";

type Props = {
  rows: AppointmentViewModel[];
  isLoading: boolean;
  onCancel: (id: number) => Promise<void>;
  isCancelling: boolean;
};

export function AppointmentTable({ rows, isLoading, onCancel, isCancelling }: Props) {
  const navigate = useNavigate();

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
        id: "progress",
        header: "Tiến độ",
        cell: ({ row }) => (
          <div className="min-w-[420px]">
            <WorkflowStepper
              steps={APPOINTMENT_PROGRESS_STEPS}
              currentIndex={appointmentProgressStepIndex(row.original) ?? 0}
              cancelledLabel={appointmentProgressCancelledLabel(row.original)}
            />
          </div>
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
          return (
            <div className="flex items-center gap-2">
              {a.workOrderID && (
                <button
                  type="button"
                  className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                  onClick={() => navigate(`/account/work-orders?workOrderId=${a.workOrderID}`)}
                >
                  Xem tiến trình
                </button>
              )}
              {a.status !== "Cancelled" && a.status !== "Completed" && (
                <button
                  type="button"
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-red-900/30 dark:text-red-400"
                  onClick={() => onCancel(a.appointmentID)}
                  disabled={isCancelling}
                >
                  Hủy
                </button>
              )}
            </div>
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

import { useMemo } from "react";
import { Send, Pencil, Trash2, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core/Table/DataTable";
import type { BroadcastViewModel } from "src/shared/types/Reponse/Broadcast";
import { STATUS_BADGE, TARGET_LABEL, formatDt } from "../broadcastHelpers";

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[status] ?? STATUS_BADGE.Draft}`}>
      {status}
    </span>
  );
}

type Props = {
  data: BroadcastViewModel[];
  isLoading: boolean;
  onEdit: (item: BroadcastViewModel) => void;
  onConfirmSend: (id: number) => void;
  onConfirmDelete: (id: number) => void;
};

export function BroadcastTable({ data, isLoading, onEdit, onConfirmSend, onConfirmDelete }: Props) {
  const columns = useMemo<ColumnDef<BroadcastViewModel>[]>(
    () => [
      {
        id: "title",
        header: "Tiêu đề",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">
              {row.original.title}
            </div>
            <div className="text-xs text-slate-400 max-w-xs truncate">{row.original.body}</div>
          </div>
        ),
      },
      {
        id: "target",
        header: "Đối tượng",
        cell: ({ row }) => (
          <div className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {TARGET_LABEL[row.original.targetType] ?? row.original.targetType}
            {row.original.targetStaffIDs && row.original.targetStaffIDs.length > 0 ? (
              <div className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                <Users className="h-3 w-3" />
                {row.original.targetStaffIDs.length} người
              </div>
            ) : row.original.staffRoleFilter ? (
              <div className="text-xs text-slate-400">{row.original.staffRoleFilter}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        id: "scheduledAt",
        header: "Lịch gửi",
        cell: ({ row }) => (
          <span className="text-slate-500 text-xs whitespace-nowrap">
            {formatDt(row.original.scheduledAt)}
          </span>
        ),
      },
      {
        id: "sentAt",
        header: "Đã gửi lúc",
        cell: ({ row }) => (
          <span className="text-slate-500 text-xs whitespace-nowrap">
            {formatDt(row.original.sentAt)}
          </span>
        ),
      },
      {
        accessorKey: "recipientCount",
        header: "Nhận",
        cell: ({ getValue }) => {
          const count = getValue<number>();
          return (
            <span className="text-center font-medium text-slate-700 dark:text-slate-200">
              {count > 0 ? count : "—"}
            </span>
          );
        },
      },
      {
        id: "creatorName",
        header: "Người tạo",
        cell: ({ row }) => (
          <span className="text-slate-500 text-xs">{row.original.creatorName ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1 justify-end">
              {(item.status === "Draft" || item.status === "Scheduled") && (
                <>
                  <button
                    title="Gửi ngay"
                    onClick={() => onConfirmSend(item.broadcastID)}
                    className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  {item.status === "Draft" && (
                    <button
                      title="Chỉnh sửa"
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
              {item.status !== "Sending" && (
                <button
                  title="Xoá"
                  onClick={() => onConfirmDelete(item.broadcastID)}
                  className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onConfirmSend, onConfirmDelete]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={isLoading}
      emptyTitle="Chưa có broadcast nào"
      emptyDescription="Tạo broadcast mới để bắt đầu."
    />
  );
}

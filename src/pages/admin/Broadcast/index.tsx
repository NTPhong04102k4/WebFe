import { Bell, Plus, RefreshCw } from "lucide-react";

import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";

import { useBroadcastHandler } from "./useBroadcastHandler";
import { BroadcastFormModal } from "./components/BroadcastFormModal";
import { BroadcastTable } from "./components/BroadcastTable";
import { ConfirmModal } from "./components/ConfirmModal";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "Draft", label: "Draft" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Sending", label: "Sending" },
  { value: "Sent", label: "Sent" },
  { value: "Failed", label: "Failed" },
];

export default function AdminBroadcastPage() {
  const h = useBroadcastHandler();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Broadcast thông báo</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => h.refetch()}
            className="p-2 rounded-lg border text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={h.openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Tạo mới
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 220 }}>
        <Select
          options={STATUS_OPTIONS}
          placeholder="Tất cả trạng thái"
          value={h.statusFilter}
          onChange={(e) => h.handleStatusFilterChange(e.target.value)}
        />
      </div>

      <BroadcastTable
        data={h.list}
        isLoading={h.isLoading}
        onEdit={h.openEditModal}
        onConfirmSend={h.openConfirmSend}
        onConfirmDelete={h.openConfirmDelete}
      />

      {h.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{h.total} broadcast</span>
          <div className="flex gap-1">
            <button
              onClick={h.handlePagePrev}
              disabled={h.page === 1}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              ←
            </button>
            <span className="px-3 py-1">{h.page} / {h.totalPages}</span>
            <button
              onClick={h.handlePageNext}
              disabled={h.page === h.totalPages}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              →
            </button>
          </div>
        </div>
      )}

      {h.modal !== null && (
        <BroadcastFormModal
          initial={h.modal.item}
          onClose={h.closeModal}
          onSubmit={h.handleSubmit}
          loading={h.mutationLoading}
        />
      )}

      <ConfirmModal
        open={h.confirmSend !== null}
        title="Gửi ngay?"
        message="Thông báo sẽ được gửi ngay đến tất cả người nhận. Không thể hoàn tác."
        confirmLabel="Gửi ngay"
        confirmClassName="bg-green-600 hover:bg-green-700"
        isPending={h.isPendingSend}
        onConfirm={h.handleSendNow}
        onClose={h.closeConfirmSend}
      />

      <ConfirmModal
        open={h.confirmDelete !== null}
        title="Xác nhận xoá?"
        message="Broadcast này sẽ bị xoá vĩnh viễn."
        confirmLabel="Xoá"
        confirmClassName="bg-red-600 hover:bg-red-700"
        isPending={h.isPendingDelete}
        onConfirm={h.handleDelete}
        onClose={h.closeConfirmDelete}
      />
    </div>
  );
}

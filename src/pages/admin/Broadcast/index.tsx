import { useState } from "react";
import { Bell, Plus, Send, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { notify } from "src/components/core/Feedback/toast";
import { useBroadcastList, useBroadcastMutations } from "src/query/broadcast/useBroadcastQueries";
import type { BroadcastViewModel } from "src/shared/types/Reponse/Broadcast";
import type { BroadcastQueryRequest, BroadcastRequest } from "src/shared/types/Request/Broadcast";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Sending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Sent: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const TARGET_LABEL: Record<string, string> = {
  Customer: "Khách hàng (FCM)",
  Staff: "Nhân viên (Email)",
  Both: "Tất cả",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[status] ?? STATUS_BADGE.Draft}`}>
      {status}
    </span>
  );
}

function formatDt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", { hour12: false });
}

type FormValues = {
  title: string;
  body: string;
  targetType: "Customer" | "Staff" | "Both";
  staffRoleFilter: string;
  scheduledAt: string;
};

function BroadcastModal({
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  initial?: BroadcastViewModel;
  onClose: () => void;
  onSubmit: (data: BroadcastRequest) => void;
  loading: boolean;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      targetType: (initial?.targetType as FormValues["targetType"]) ?? "Customer",
      staffRoleFilter: initial?.staffRoleFilter ?? "",
      scheduledAt: initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : "",
    },
  });

  const targetType = watch("targetType");

  const submit = (vals: FormValues) => {
    onSubmit({
      title: vals.title,
      body: vals.body,
      targetType: vals.targetType,
      staffRoleFilter: vals.staffRoleFilter || undefined,
      scheduledAt: vals.scheduledAt ? new Date(vals.scheduledAt).toISOString() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {initial ? "Chỉnh sửa broadcast" : "Tạo broadcast mới"}
        </h2>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", { required: "Bắt buộc" })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Tiêu đề thông báo..."
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("body", { required: "Bắt buộc" })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
              placeholder="Nội dung thông báo..."
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Đối tượng</label>
            <select
              {...register("targetType")}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="Customer">Khách hàng (FCM push)</option>
              <option value="Staff">Nhân viên (Email)</option>
              <option value="Both">Tất cả</option>
            </select>
          </div>

          {(targetType === "Staff" || targetType === "Both") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lọc theo vai trò nhân viên <span className="text-slate-400">(để trống = tất cả)</span>
              </label>
              <input
                {...register("staffRoleFilter")}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="VD: Technician, Admin..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Gửi lúc <span className="text-slate-400">(để trống = lưu nháp)</span>
            </label>
            <input
              type="datetime-local"
              {...register("scheduledAt")}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBroadcastPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: BroadcastViewModel } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmSend, setConfirmSend] = useState<number | null>(null);

  const query: BroadcastQueryRequest = { page, pageSize: PAGE_SIZE, status: statusFilter || undefined };
  const { data, isLoading, refetch } = useBroadcastList(query);
  const { create, update, remove, sendNow } = useBroadcastMutations();

  const list = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSubmit = async (values: BroadcastRequest) => {
    try {
      if (modal?.mode === "edit" && modal.item) {
        await update.mutateAsync({ id: modal.item.broadcastID, data: values });
        notify.success("Đã cập nhật broadcast");
      } else {
        await create.mutateAsync(values);
        notify.success("Đã tạo broadcast");
      }
      setModal(null);
    } catch {
      // interceptor already shows error toast
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      notify.success("Đã xoá broadcast");
    } catch {
      // interceptor handles
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      const res = await sendNow.mutateAsync(id);
      notify.success(res.message ?? "Đã gửi thành công");
    } catch {
      // interceptor handles
    } finally {
      setConfirmSend(null);
    }
  };

  const mutationLoading = create.isPending || update.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Broadcast thông báo</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Tạo mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Sending">Sending</option>
          <option value="Sent">Sent</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có broadcast nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Đối tượng</th>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Lịch gửi</th>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Đã gửi lúc</th>
                <th className="text-center px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Nhận</th>
                <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Người tạo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {list.map((item) => (
                <tr key={item.broadcastID} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">{item.title}</div>
                    <div className="text-xs text-slate-400 max-w-xs truncate">{item.body}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {TARGET_LABEL[item.targetType] ?? item.targetType}
                    {item.staffRoleFilter && (
                      <div className="text-xs text-slate-400">{item.staffRoleFilter}</div>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDt(item.scheduledAt)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDt(item.sentAt)}</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-200">
                    {item.recipientCount > 0 ? item.recipientCount : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{item.creatorName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {(item.status === "Draft" || item.status === "Scheduled") && (
                        <>
                          <button
                            title="Gửi ngay"
                            onClick={() => setConfirmSend(item.broadcastID)}
                            className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          {item.status === "Draft" && (
                            <button
                              title="Chỉnh sửa"
                              onClick={() => setModal({ mode: "edit", item })}
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
                          onClick={() => setConfirmDelete(item.broadcastID)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total} broadcast</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              ←
            </button>
            <span className="px-3 py-1">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <BroadcastModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={mutationLoading}
        />
      )}

      {/* Confirm Send */}
      {confirmSend !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmSend(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Gửi ngay?</h3>
            <p className="text-sm text-slate-500">Thông báo sẽ được gửi ngay đến tất cả người nhận. Không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmSend(null)} className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100">Huỷ</button>
              <button
                onClick={() => handleSendNow(confirmSend)}
                disabled={sendNow.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {sendNow.isPending ? "Đang gửi..." : "Gửi ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Xác nhận xoá?</h3>
            <p className="text-sm text-slate-500">Broadcast này sẽ bị xoá vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100">Huỷ</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={remove.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

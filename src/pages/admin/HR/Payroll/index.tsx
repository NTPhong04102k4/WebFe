import { DataTable, EmptyState, Input, Modal } from "src/components/common";
import { usePayrollHandler } from "./usePayrollHandler";

export default function AdminPayrollPage() {
  const h = usePayrollHandler();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bảng lương</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quản lý payroll theo nhân sự và kỳ lương</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={h.openCreate}>
            Tạo bảng lương
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Staff ID"
            value={h.staffId}
            onChange={(e) => { h.setStaffId(e.target.value); h.setPage(1); }}
            placeholder="Lọc theo staff"
          />
          <Input
            label="Kỳ lương"
            type="month"
            value={h.period}
            onChange={(e) => { h.setPeriod(e.target.value); h.setPage(1); }}
          />
        </div>
      </div>

      {h.error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Không lấy được danh sách bảng lương.
        </div>
      ) : h.payrolls.length === 0 && !h.isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có bảng lương" description="Chưa có bảng lương phù hợp." />
        </div>
      ) : (
        <DataTable data={h.payrolls} columns={h.columns} loading={h.isLoading} getRowId={(row) => String(row.payrollID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {h.data?.page ?? h.page} - {h.data?.totalCount ?? 0} kết quả</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={h.page <= 1} onClick={() => h.setPage(h.page - 1)}>Trước</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(h.data?.data.length ?? 0) < 20} onClick={() => h.setPage(h.page + 1)}>Sau</button>
        </div>
      </div>

      <Modal
        open={h.open}
        onClose={() => h.setOpen(false)}
        title={h.editing ? "Sửa bảng lương" : "Tạo bảng lương"}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => h.setOpen(false)}>Hủy</button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={h.save} disabled={h.isSaving}>Lưu</button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Staff ID" type="number" value={h.form.staffID} disabled={Boolean(h.editing)} onChange={(e) => h.setForm({ ...h.form, staffID: Number(e.target.value) })} />
          <Input label="Kỳ lương" type="date" value={h.form.payPeriod.slice(0, 10)} onChange={(e) => h.setForm({ ...h.form, payPeriod: e.target.value })} />
          <Input label="Lương cơ bản" type="number" value={h.form.baseSalary} onChange={(e) => h.setForm({ ...h.form, baseSalary: Number(e.target.value) })} />
          <Input label="Giờ làm" type="number" value={h.form.workingHours} onChange={(e) => h.setForm({ ...h.form, workingHours: Number(e.target.value) })} />
          <Input label="Tăng ca" type="number" value={h.form.overtimeHours} onChange={(e) => h.setForm({ ...h.form, overtimeHours: Number(e.target.value) })} />
          <Input label="Jobs" type="number" value={h.form.jobsCompleted} onChange={(e) => h.setForm({ ...h.form, jobsCompleted: Number(e.target.value) })} />
          <Input label="Commission" type="number" value={h.form.commissionAmount} onChange={(e) => h.setForm({ ...h.form, commissionAmount: Number(e.target.value) })} />
          <Input label="Bonus" type="number" value={h.form.bonusAmount} onChange={(e) => h.setForm({ ...h.form, bonusAmount: Number(e.target.value) })} />
          <Input label="Deduction" type="number" value={h.form.deductionAmount} onChange={(e) => h.setForm({ ...h.form, deductionAmount: Number(e.target.value) })} />
          <Input label="Tax" type="number" value={h.form.taxAmount} onChange={(e) => h.setForm({ ...h.form, taxAmount: Number(e.target.value) })} />
          <Input className="md:col-span-2" label="Ghi chú" value={h.form.notes ?? ""} onChange={(e) => h.setForm({ ...h.form, notes: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={Boolean(h.payOpen)}
        onClose={() => h.setPayOpen(null)}
        title="Thanh toán bảng lương"
        footer={
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => h.setPayOpen(null)}>Hủy</button>
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white" onClick={h.markPaid} disabled={h.isMarkingPaid}>
              Đánh dấu Paid
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Xác nhận thanh toán bảng lương cho {h.payOpen?.staffFullName || h.payOpen?.staffID}?
        </p>
      </Modal>

      <Modal
        open={!!h.deleteConfirmItem}
        onClose={() => h.setDeleteConfirmItem(null)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => h.setDeleteConfirmItem(null)} disabled={h.isDeleting}>Hủy</button>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60" onClick={h.confirmDelete} disabled={h.isDeleting}>
              {h.isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Xóa bảng lương của {h.deleteConfirmItem?.staffFullName || h.deleteConfirmItem?.staffID}? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

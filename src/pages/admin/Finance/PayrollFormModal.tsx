import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { useFinancePayrollMutations } from "src/query/finance/useFinanceQueries";
import { useStaffList } from "src/query/staff/useStaffQueries";
import type { PayrollRequest } from "src/services/api/functions/hr/hr.types";

type Props = {
  open: boolean;
  onClose: () => void;
};

const emptyForm = (): PayrollRequest => ({
  staffID: 0,
  payPeriod: new Date().toISOString().slice(0, 7),
  baseSalary: 0,
  workingHours: 160,
  overtimeHours: 0,
  jobsCompleted: 0,
  commissionAmount: 0,
  bonusAmount: 0,
  deductionAmount: 0,
  taxAmount: 0,
  notes: "",
});

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export function PayrollFormModal({ open, onClose }: Props) {
  const [form, setForm] = useState<PayrollRequest>(emptyForm());
  const { createPayroll, previewPayroll } = useFinancePayrollMutations();
  const staffQ = useStaffList({ page: 1, pageSize: 100, isActive: true });
  const staffList = staffQ.data?.data ?? [];

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  // Tự động tính lương từ WorkOrder thực tế khi chọn nhân viên + kỳ lương
  useEffect(() => {
    if (!open || !form.staffID || !form.payPeriod) return;
    const [y, m] = form.payPeriod.split("-").map(Number);
    previewPayroll.mutate(
      { staffId: form.staffID, year: y, month: m },
      {
        onSuccess: (res) => {
          const p = res.data;
          if (!p) return;
          setForm((f) => ({
            ...f,
            baseSalary: p.baseSalary,
            workingHours: p.workingHours,
            jobsCompleted: p.jobsCompleted,
            commissionAmount: p.commissionAmount,
            bonusAmount: p.bonusAmount,
          }));
        },
        // Nhân viên không phải kỹ thuật viên / chưa có bậc lương -> giữ giá trị nhập tay
        onError: () => {},
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.staffID, form.payPeriod]);

  if (!open) return null;

  const set = <K extends keyof PayrollRequest>(k: K, v: PayrollRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const netSalary = form.baseSalary + form.bonusAmount + form.commissionAmount - form.deductionAmount - form.taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffID) { notify.error("Vui lòng chọn nhân viên"); return; }
    try {
      await createPayroll.mutateAsync({ ...form, payPeriod: `${form.payPeriod}-01` });
      notify.success("Tạo phiếu lương thành công");
      onClose();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Tạo phiếu lương</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Nhân viên <span className="text-red-500">*</span></label>
            <select
              required
              value={form.staffID || ""}
              onChange={(e) => set("staffID", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffList.map((s) => (
                <option key={s.staffID ?? s.id} value={s.staffID ?? s.id}>
                  {s.fullName} ({s.staffCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Kỳ lương</label>
            <input
              type="month"
              value={form.payPeriod}
              onChange={(e) => set("payPeriod", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            {previewPayroll.isPending && (
              <p className="mt-1 text-xs text-slate-400">Đang tính lương từ dữ liệu công việc thực tế...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Lương cơ bản", key: "baseSalary" as const, required: true },
              { label: "Giờ làm việc", key: "workingHours" as const },
              { label: "Giờ OT", key: "overtimeHours" as const },
              { label: "Jobs hoàn thành", key: "jobsCompleted" as const },
              { label: "Hoa hồng", key: "commissionAmount" as const },
              { label: "Thưởng", key: "bonusAmount" as const },
              { label: "Khấu trừ", key: "deductionAmount" as const },
              { label: "Thuế", key: "taxAmount" as const },
            ].map(({ label, key, required }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {label}{required && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  required={required}
                  value={form[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ghi chú</label>
            <textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Net salary preview */}
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-slate-500 dark:text-slate-400">Thực nhận = Lương CB + Thưởng + Hoa hồng - Khấu trừ - Thuế</p>
            <p className={`mt-1 text-xl font-bold ${netSalary >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-600"}`}>
              {fmt(netSalary)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
              Hủy
            </button>
            <button type="submit" disabled={createPayroll.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {createPayroll.isPending ? "Đang tạo..." : "Tạo phiếu lương"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import { usePayrolls, usePayrollMutations } from "src/query/hr/useHrQueries";
import type { PayrollRequest, PayrollViewModel } from "src/services/api/functions/hr/hr.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const currentMonth = new Date().toISOString().slice(0, 7);

const emptyForm: PayrollRequest = {
  staffID: 0,
  payPeriod: `${currentMonth}-01`,
  baseSalary: 0,
  workingHours: 0,
  overtimeHours: 0,
  jobsCompleted: 0,
  commissionAmount: 0,
  bonusAmount: 0,
  deductionAmount: 0,
  taxAmount: 0,
  notes: "",
};

export default function AdminPayrollPage() {
  const [page, setPage] = useState(1);
  const [staffId, setStaffId] = useState("");
  const [period, setPeriod] = useState("");
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<PayrollViewModel | null>(null);
  const [editing, setEditing] = useState<PayrollViewModel | null>(null);
  const [form, setForm] = useState<PayrollRequest>(emptyForm);
  const { data, isLoading, error } = usePayrolls({
    page,
    pageSize: 20,
    staffId: staffId ? Number(staffId) : undefined,
    period: period ? `${period}-01` : undefined,
  });
  const { createPayroll, updatePayroll, markPayrollPaid, deletePayroll } = usePayrollMutations();
  const payrolls = data?.data ?? [];

  const columns = useMemo<ColumnDef<PayrollViewModel>[]>(
    () => [
      { accessorKey: "staffFullName", header: "Nhan su", cell: ({ row }) => row.original.staffFullName || `Staff #${row.original.staffID}` },
      { accessorKey: "payPeriod", header: "Ky luong", cell: ({ getValue }) => String(getValue()).slice(0, 7) },
      { accessorKey: "baseSalary", header: "Luong CB", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "grossSalary", header: "Gross", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "netSalary", header: "Net", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "paymentStatus", header: "Thanh toan" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sua</button>
            <button className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700" onClick={() => setPayOpen(row.original)}>Pay</button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => remove(row.original)}>Xoa</button>
          </div>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (payroll: PayrollViewModel) => {
    setEditing(payroll);
    setForm({
      staffID: payroll.staffID,
      payPeriod: payroll.payPeriod.slice(0, 10),
      baseSalary: payroll.baseSalary,
      workingHours: payroll.workingHours,
      overtimeHours: payroll.overtimeHours,
      jobsCompleted: payroll.jobsCompleted,
      commissionAmount: payroll.commissionAmount,
      bonusAmount: payroll.bonusAmount,
      deductionAmount: payroll.deductionAmount,
      taxAmount: payroll.taxAmount,
      notes: payroll.notes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, payPeriod: new Date(form.payPeriod).toISOString() };
      if (editing) {
        await updatePayroll.mutateAsync({ id: editing.payrollID, body: payload });
        toast.success("Cap nhat bang luong thanh cong");
      } else {
        await createPayroll.mutateAsync(payload);
        toast.success("Tao bang luong thanh cong");
      }
      setOpen(false);
    } catch {
      toast.error("Luu bang luong that bai");
    }
  };

  const remove = async (payroll: PayrollViewModel) => {
    if (!window.confirm(`Xoa bang luong ${payroll.staffFullName || payroll.staffID}?`)) return;
    try {
      await deletePayroll.mutateAsync(payroll.payrollID);
      toast.success("Da xoa bang luong");
    } catch {
      toast.error("Xoa bang luong that bai");
    }
  };

  const markPaid = async () => {
    if (!payOpen) return;
    try {
      await markPayrollPaid.mutateAsync({
        id: payOpen.payrollID,
        body: { paymentStatus: "Paid", paidDate: new Date().toISOString() },
      });
      toast.success("Da danh dau da thanh toan");
      setPayOpen(null);
    } catch {
      toast.error("Cap nhat thanh toan that bai");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bang luong</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quan ly payroll theo nhan su va ky luong</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tao bang luong</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Staff ID" value={staffId} onChange={(event) => { setStaffId(event.target.value); setPage(1); }} placeholder="Loc theo staff" />
          <Input label="Ky luong" type="month" value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); }} />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach bang luong.</div>
      ) : payrolls.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co bang luong" description="Chua co bang luong phu hop." />
        </div>
      ) : (
        <DataTable data={payrolls} columns={columns} loading={isLoading} getRowId={(row) => String(row.payrollID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} - {data?.totalCount ?? 0} ket qua</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Truoc</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sua bang luong" : "Tao bang luong"} size="xl" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createPayroll.isPending || updatePayroll.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Staff ID" type="number" value={form.staffID} disabled={Boolean(editing)} onChange={(event) => setForm({ ...form, staffID: Number(event.target.value) })} />
          <Input label="Ky luong" type="date" value={form.payPeriod.slice(0, 10)} onChange={(event) => setForm({ ...form, payPeriod: event.target.value })} />
          <Input label="Luong co ban" type="number" value={form.baseSalary} onChange={(event) => setForm({ ...form, baseSalary: Number(event.target.value) })} />
          <Input label="Gio lam" type="number" value={form.workingHours} onChange={(event) => setForm({ ...form, workingHours: Number(event.target.value) })} />
          <Input label="Tang ca" type="number" value={form.overtimeHours} onChange={(event) => setForm({ ...form, overtimeHours: Number(event.target.value) })} />
          <Input label="Jobs" type="number" value={form.jobsCompleted} onChange={(event) => setForm({ ...form, jobsCompleted: Number(event.target.value) })} />
          <Input label="Commission" type="number" value={form.commissionAmount} onChange={(event) => setForm({ ...form, commissionAmount: Number(event.target.value) })} />
          <Input label="Bonus" type="number" value={form.bonusAmount} onChange={(event) => setForm({ ...form, bonusAmount: Number(event.target.value) })} />
          <Input label="Deduction" type="number" value={form.deductionAmount} onChange={(event) => setForm({ ...form, deductionAmount: Number(event.target.value) })} />
          <Input label="Tax" type="number" value={form.taxAmount} onChange={(event) => setForm({ ...form, taxAmount: Number(event.target.value) })} />
          <Input className="md:col-span-2" label="Ghi chu" value={form.notes ?? ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
      </Modal>

      <Modal open={Boolean(payOpen)} onClose={() => setPayOpen(null)} title="Thanh toan bang luong" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setPayOpen(null)}>Huy</button>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white" onClick={markPaid} disabled={markPayrollPaid.isPending}>Danh dau Paid</button>
        </div>
      }>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Xac nhan thanh toan bang luong cho {payOpen?.staffFullName || payOpen?.staffID}?
        </p>
      </Modal>
    </div>
  );
}

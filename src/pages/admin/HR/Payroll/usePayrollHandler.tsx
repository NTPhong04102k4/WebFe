import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";
import { usePayrolls, usePayrollMutations } from "src/query/hr/useHrQueries";
import type { PayrollRequest, PayrollViewModel } from "src/services/api/functions/hr/hr.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const currentMonth = new Date().toISOString().slice(0, 7);

export const emptyForm: PayrollRequest = {
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

export function usePayrollHandler() {
  const [page, setPage] = useState(1);
  const [staffId, setStaffId] = useState("");
  const [period, setPeriod] = useState("");
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<PayrollViewModel | null>(null);
  const [editing, setEditing] = useState<PayrollViewModel | null>(null);
  const [form, setForm] = useState<PayrollRequest>(emptyForm);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<PayrollViewModel | null>(null);

  const { data, isLoading, error } = usePayrolls({
    page,
    pageSize: 20,
    staffId: staffId ? Number(staffId) : undefined,
    period: period ? `${period}-01` : undefined,
  });
  const { createPayroll, updatePayroll, markPayrollPaid, deletePayroll } = usePayrollMutations();
  const payrolls = data?.data ?? [];

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
        notify.success("Cap nhat bang luong thanh cong");
      } else {
        await createPayroll.mutateAsync(payload);
        notify.success("Tao bang luong thanh cong");
      }
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await deletePayroll.mutateAsync(deleteConfirmItem.payrollID);
      notify.success("Da xoa bang luong");
      setDeleteConfirmItem(null);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const markPaid = async () => {
    if (!payOpen) return;
    try {
      await markPayrollPaid.mutateAsync({
        id: payOpen.payrollID,
        body: { paymentStatus: "Paid", paidDate: new Date().toISOString() },
      });
      notify.success("Da danh dau da thanh toan");
      setPayOpen(null);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<PayrollViewModel>[]>(
    () => [
      {
        accessorKey: "staffFullName",
        header: "Nhan su",
        cell: ({ row }) => row.original.staffFullName || `Staff #${row.original.staffID}`,
      },
      {
        accessorKey: "payPeriod",
        header: "Ky luong",
        cell: ({ getValue }) => String(getValue()).slice(0, 7),
      },
      {
        accessorKey: "baseSalary",
        header: "Luong CB",
        cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)),
      },
      {
        accessorKey: "grossSalary",
        header: "Gross",
        cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)),
      },
      {
        accessorKey: "netSalary",
        header: "Net",
        cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)),
      },
      { accessorKey: "paymentStatus", header: "Thanh toan" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sua</button>
            <button className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700" onClick={() => setPayOpen(row.original)}>Pay</button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => setDeleteConfirmItem(row.original)}>Xoa</button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    page, setPage,
    staffId, setStaffId,
    period, setPeriod,
    open, setOpen,
    payOpen, setPayOpen,
    editing,
    form, setForm,
    deleteConfirmItem, setDeleteConfirmItem,
    data, isLoading, error,
    payrolls,
    columns,
    openCreate,
    save,
    confirmDelete,
    markPaid,
    isSaving: createPayroll.isPending || updatePayroll.isPending,
    isDeleting: deletePayroll.isPending,
    isMarkingPaid: markPayrollPaid.isPending,
  };
}

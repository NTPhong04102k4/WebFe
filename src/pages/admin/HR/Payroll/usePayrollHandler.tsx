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
  const [form, setForm] = useState<PayrollRequest>(emptyForm);

  const { data, isLoading, error } = usePayrolls({
    page,
    pageSize: 20,
    staffId: staffId ? Number(staffId) : undefined,
    period: period ? `${period}-01` : undefined,
  });
  const { createPayroll, markPayrollPaid } = usePayrollMutations();
  const payrolls = data?.data ?? [];

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, payPeriod: new Date(form.payPeriod).toISOString() };
      await createPayroll.mutateAsync(payload);
      notify.success("Tao bang luong thanh cong");
      setOpen(false);
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
        id: "commission",
        header: "Hoa hong (theo job)",
        cell: ({ row }) => (
          <div className="text-right">
            <div>{formatCurrency(Number(row.original.commissionAmount || 0))}</div>
            <div className="text-xs text-slate-400">{row.original.jobsCompleted || 0} job</div>
          </div>
        ),
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
        cell: ({ row }) => {
          const isPaid = row.original.paymentStatus === "Paid";
          return (
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setPayOpen(row.original)}
                disabled={isPaid}
              >
                {isPaid ? "Da thanh toan" : "Pay"}
              </button>
            </div>
          );
        },
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
    form, setForm,
    data, isLoading, error,
    payrolls,
    columns,
    openCreate,
    save,
    markPaid,
    isSaving: createPayroll.isPending,
    isMarkingPaid: markPayrollPaid.isPending,
  };
}

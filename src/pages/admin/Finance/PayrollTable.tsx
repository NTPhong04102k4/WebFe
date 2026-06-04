import { useEffect, useState } from "react";
import { Plus, Trash2, CheckSquare, Eye } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import {
  useFinancePayrolls,
  useFinancePayrollMutations,
} from "src/query/finance/useFinanceQueries";
import type { PayrollViewModel } from "src/services/api/functions/hr/hr.types";
import { PayrollFormModal } from "./PayrollFormModal";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const PAGE_SIZE = 10;

type Props = {
  totalExpense: number;
  fromDate?: string;
  toDate?: string;
};

function monthToRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  return {
    from: `${month}-01`,
    to: new Date(y, m, 0).toISOString().slice(0, 10),
  };
}

export function PayrollTable({ totalExpense, fromDate: fromProp, toDate: toProp }: Props) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (fromProp) {
      setMonth(fromProp.slice(0, 7));
      setPage(1);
    }
  }, [fromProp]);

  const controlled = !!fromProp;
  const { from: derivedFrom, to: derivedTo } = monthToRange(month);
  const queryFromDate = fromProp ?? derivedFrom;
  const queryToDate = toProp ?? derivedTo;

  const { data, isLoading } = useFinancePayrolls({
    page,
    pageSize: PAGE_SIZE,
    fromDate: queryFromDate,
    toDate: queryToDate,
  });
  const { markPaid, deletePayroll } = useFinancePayrollMutations();

  const payrolls = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleMarkPaid = (payroll: PayrollViewModel) => {
    if (!window.confirm(`Đánh dấu đã trả lương cho ${payroll.staffFullName}?`)) return;
    markPaid.mutate(
      { id: payroll.payrollID, body: { paymentStatus: "Paid", paidDate: new Date().toISOString().slice(0, 10) } },
      {
        onSuccess: () => notify.success("Đã đánh dấu đã trả lương"),
      }
    );
  };

  const handleDelete = (payroll: PayrollViewModel) => {
    if (!window.confirm(`Xóa phiếu lương của ${payroll.staffFullName}?`)) return;
    deletePayroll.mutate(payroll.payrollID, {
      onSuccess: () => notify.success("Đã xóa phiếu lương"),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Quản lý lương</h2>
          <p className="text-xs text-slate-400">Tổng chi tháng: <span className="font-medium text-red-600">{fmt(totalExpense)}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {controlled ? (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              {queryFromDate} → {queryToDate}
            </span>
          ) : (
            <input
              type="month"
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Kỳ lương</th>
              <th className="px-4 py-3 text-right">Lương CB</th>
              <th className="px-4 py-3 text-right">Thưởng</th>
              <th className="px-4 py-3 text-right">Khấu trừ</th>
              <th className="px-4 py-3 text-right">Thực nhận</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">Đang tải...</td></tr>
            )}
            {!isLoading && payrolls.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">Không có phiếu lương nào.</td></tr>
            )}
            {payrolls.map((p) => (
              <tr key={p.payrollID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{p.staffFullName ?? `Staff #${p.staffID}`}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.payPeriod}</td>
                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{fmt(p.baseSalary)}</td>
                <td className="px-4 py-3 text-right text-emerald-600">{fmt(p.bonusAmount)}</td>
                <td className="px-4 py-3 text-right text-red-500">{fmt(p.deductionAmount + p.taxAmount)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{fmt(p.netSalary)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.paymentStatus] ?? STATUS_COLORS.Draft}`}>
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.paymentStatus === "Draft" && (
                      <>
                        <button
                          onClick={() => handleMarkPaid(p)}
                          className="rounded border border-blue-400 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
                          title="Đánh dấu đã trả"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {p.paymentStatus === "Approved" && (
                      <>
                        <button
                          onClick={() => handleMarkPaid(p)}
                          className="rounded border border-green-400 px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400"
                        >
                          Đã trả
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {p.paymentStatus === "Paid" && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye className="h-3.5 w-3.5" />
                        {p.paidDate ? new Date(p.paidDate).toLocaleDateString("vi-VN") : "Xem"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm dark:border-slate-700">
          <span className="text-slate-400">Tổng {total} · Trang {page}/{totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="rounded border border-slate-300 px-3 py-1 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">
              Trước
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate-300 px-3 py-1 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300">
              Sau
            </button>
          </div>
        </div>
      )}

      <PayrollFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

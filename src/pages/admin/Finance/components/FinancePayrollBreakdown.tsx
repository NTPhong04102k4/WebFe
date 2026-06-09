import { Loading } from "src/components/core";
import { fmt } from "../financeHelpers";

type Payroll = {
  payrollID: number;
  staffID: number;
  staffFullName?: string | null;
  netSalary: number;
};

type PayrollSummaryData = {
  totalNetSalary: number;
  totalStaffPaid: number;
  totalBaseSalary: number;
  totalBonus: number;
  totalCommission: number;
};

type Props = {
  payrolls: Payroll[];
  payrollExpense: number;
  fromDate: string;
  toDate: string;
  payrollSummaryQ: {
    isLoading: boolean;
    data?: PayrollSummaryData | null;
  };
};

export function FinancePayrollBreakdown({
  payrolls,
  payrollExpense,
  fromDate,
  toDate,
  payrollSummaryQ,
}: Props) {
  if (payrolls.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
            Top 10 chi phí lương theo nhân viên
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({fromDate} → {toDate})
            </span>
          </h2>
          <div className="space-y-3">
            {[...payrolls]
              .sort((a, b) => b.netSalary - a.netSalary)
              .slice(0, 10)
              .map((p) => {
                const pct = payrollExpense ? (p.netSalary / payrollExpense) * 100 : 0;
                return (
                  <div key={p.payrollID}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">
                        {p.staffFullName ?? `Staff #${p.staffID}`}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {fmt(p.netSalary)} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 md:border-t-0 md:pt-0 md:pl-6 md:border-l md:border-slate-200 dark:border-slate-800">
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
            Thống kê chi tiết quỹ lương
            <span className="ml-2 text-xs font-normal text-slate-400">
              (Từ GET /finance/payroll-summary)
            </span>
          </h2>
          {payrollSummaryQ.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loading />
            </div>
          ) : payrollSummaryQ.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-xs text-slate-400 font-medium">Tổng thực nhận (Net)</p>
                <p className="text-lg font-bold text-orange-600 mt-0.5">
                  {fmt(payrollSummaryQ.data.totalNetSalary)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-xs text-slate-400 font-medium">Số nhân viên được nhận</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {payrollSummaryQ.data.totalStaffPaid} nhân viên
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-xs text-slate-400 font-medium">Tổng lương cơ bản</p>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {fmt(payrollSummaryQ.data.totalBaseSalary)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-xs text-slate-400 font-medium">Tổng tiền thưởng</p>
                <p className="text-base font-semibold text-emerald-600 mt-0.5">
                  {fmt(payrollSummaryQ.data.totalBonus)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30 sm:col-span-2">
                <p className="text-xs text-slate-400 font-medium">Tổng hoa hồng (Commission)</p>
                <p className="text-base font-semibold text-blue-600 mt-0.5">
                  {fmt(payrollSummaryQ.data.totalCommission)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              Không có dữ liệu quỹ lương.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

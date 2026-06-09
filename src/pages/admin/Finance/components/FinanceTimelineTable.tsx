import { fmt, fmtPeriodLabel } from "../financeHelpers";

type TimelineRow = {
  label: string;
  orderRevenue: number;
  workshopRevenue: number;
  payrollExpense: number;
  partsExpense: number;
  totalRevenue: number;
  grossProfit: number;
};

type Props = {
  timeline: TimelineRow[];
  currentPeriodLabel: string;
  fromDate: string;
  toDate: string;
  orderRevenue: number;
  workshopRevenue: number;
  payrollExpense: number;
  partsExpense: number;
  totalRevenue: number;
  grossProfit: number;
};

export function FinanceTimelineTable({
  timeline,
  currentPeriodLabel,
  fromDate,
  toDate,
  orderRevenue,
  workshopRevenue,
  payrollExpense,
  partsExpense,
  totalRevenue,
  grossProfit,
}: Props) {
  if (timeline.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Chi tiết theo kỳ</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {fromDate} → {toDate} · {timeline.length} kỳ
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Kỳ</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-blue-500">D.thu đơn hàng</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-500">D.thu Workshop</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-orange-500">Chi lương</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-amber-500">Chi phụ tùng</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-500">Tổng thu</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-violet-500">Lợi nhuận</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {timeline.map((row) => {
              const isCurrent = row.label.startsWith(currentPeriodLabel);
              return (
                <tr
                  key={row.label}
                  className={`transition-colors ${
                    isCurrent
                      ? "bg-violet-50 dark:bg-violet-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {fmtPeriodLabel(row.label)}
                    {isCurrent && (
                      <span className="ml-2 inline-block rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                        Hiện tại
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.orderRevenue)}</td>
                  <td className="px-4 py-3 text-right text-cyan-600 dark:text-cyan-400">{fmt(row.workshopRevenue)}</td>
                  <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">{fmt(row.payrollExpense)}</td>
                  <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">{fmt(row.partsExpense)}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">{fmt(row.totalRevenue)}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      row.grossProfit >= 0
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {row.grossProfit >= 0 ? "+" : ""}
                    {fmt(row.grossProfit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">TỔNG CỘNG</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(orderRevenue)}</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-cyan-600 dark:text-cyan-400">{fmt(workshopRevenue)}</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-orange-600 dark:text-orange-400">{fmt(payrollExpense)}</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-amber-600 dark:text-amber-400">{fmt(partsExpense)}</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalRevenue)}</td>
              <td
                className={`px-4 py-3 text-right text-xs font-bold ${
                  grossProfit >= 0
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {grossProfit >= 0 ? "+" : ""}
                {fmt(grossProfit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

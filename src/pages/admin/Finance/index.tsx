import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  CalendarRange,
  RotateCcw,
  Wrench,
  Package,
  ClipboardList,
} from "lucide-react";
import {
  useFinanceRevenue,
  useFinancePayrolls,
  useFinanceSummary,
  useFinancePayrollSummary,
} from "src/query/finance/useFinanceQueries";
import { RevenueChart } from "./RevenueChart";
import { PayrollTable } from "./PayrollTable";

const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const now = new Date();
const DEFAULT_FROM = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
const DEFAULT_TO = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

function groupByFromRange(from: string, to: string): "Day" | "Month" {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400_000;
  return days <= 31 ? "Day" : "Month";
}

/** Format tháng/ngày ngắn gọn để hiển thị trong bảng */
function fmtPeriodLabel(label: string): string {
  // label có thể là "YYYY-MM" hoặc "YYYY-MM-DD"
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [y, m] = label.split("-");
    return `Tháng ${m}/${y}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [y, m, d] = label.split("-");
    return `${d}/${m}/${y}`;
  }
  return label;
}

export default function AdminFinancePage() {
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);

  const isCurrentMonth = fromDate === DEFAULT_FROM && toDate === DEFAULT_TO;
  const groupBy = groupByFromRange(fromDate, toDate);

  // ─── Data hooks ──────────────────────────────────────────────────────────
  const summaryQ = useFinanceSummary({ fromDate, toDate, groupBy });
  const revenueQ = useFinanceRevenue({ fromDate, toDate, groupBy });
  const payrollQ = useFinancePayrolls({ fromDate, toDate, page: 1, pageSize: 1000 });
  const payrollSummaryQ = useFinancePayrollSummary({ fromDate, toDate });

  // ─── Ưu tiên data từ /finance/summary, fallback về revenue query ──────────
  const summary = summaryQ.data;

  const totalRevenue = summary?.totalRevenue ?? revenueQ.data?.totalRevenue ?? 0;
  const orderRevenue = summary?.orderRevenue ?? revenueQ.data?.totalRevenue ?? 0;
  const workshopRevenue = summary?.workshopRevenue ?? 0;

  const payrolls = payrollQ.data?.data ?? [];
  const fallbackExpense = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalExpense = summary?.totalExpense ?? fallbackExpense;
  const payrollExpense = summary?.payrollExpense ?? fallbackExpense;
  const partsExpense = summary?.partsExpense ?? 0;

  const grossProfit = summary?.grossProfit ?? totalRevenue - totalExpense;

  const totalOrders = summary?.totalOrders ?? revenueQ.data?.totalOrders ?? 0;
  const totalWorkOrders = summary?.totalWorkOrders ?? 0;

  const isLoading = summaryQ.isLoading || revenueQ.isLoading;

  const handleReset = () => {
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
  };

  // ─── Tháng hiện tại để highlight bảng ────────────────────────────────────
  const currentPeriodLabel = toISO(new Date()).slice(0, 7); // "YYYY-MM"

  // ─── Timeline cho bảng chi tiết ──────────────────────────────────────────
  const timeline = summary?.timeline ?? [];

  // ─── Stats cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Tổng doanh thu",
      value: isLoading ? "…" : fmt(totalRevenue),
      sub: "Đơn hàng + Workshop",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      text: "text-emerald-600",
      large: true,
    },
    {
      label: "Doanh thu đơn hàng",
      value: isLoading ? "…" : fmt(orderRevenue),
      sub: `${totalOrders} đơn`,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600",
    },
    {
      label: "Doanh thu Workshop",
      value: isLoading ? "…" : fmt(workshopRevenue),
      sub: `${totalWorkOrders} work order`,
      icon: Wrench,
      gradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600",
    },
    {
      label: "Tổng chi phí",
      value: isLoading ? "…" : fmt(totalExpense),
      sub: "Lương + Phụ tùng",
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
      text: "text-red-600",
    },
    {
      label: "Chi phí lương",
      value: isLoading ? "…" : fmt(payrollExpense),
      sub: "Lương nhân viên",
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      text: "text-orange-600",
    },
    {
      label: "Chi phí phụ tùng",
      value: isLoading ? "…" : fmt(partsExpense),
      sub: "Vật tư, linh kiện",
      icon: Package,
      gradient: "from-amber-500 to-amber-600",
      text: "text-amber-600",
    },
    {
      label: "Lợi nhuận gộp",
      value: isLoading ? "…" : fmt(grossProfit),
      sub: grossProfit >= 0 ? "Dương ✓" : "Âm ✗",
      icon: grossProfit >= 0 ? TrendingUp : TrendingDown,
      gradient:
        grossProfit >= 0 ? "from-violet-500 to-violet-600" : "from-rose-500 to-rose-600",
      text: grossProfit >= 0 ? "text-violet-600" : "text-rose-600",
      large: true,
    },
    {
      label: "Tổng Work Orders",
      value: isLoading ? "…" : totalWorkOrders,
      sub: "Lệnh sửa chữa",
      icon: ClipboardList,
      gradient: "from-indigo-500 to-indigo-600",
      text: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Tổng quan Tài chính
          </h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {isCurrentMonth ? fromDate.slice(0, 7) : `${fromDate} → ${toDate}`}
          </span>
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="text-xs text-slate-400">đến</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {!isCurrentMonth && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Tháng này
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Cards: 4 cột trên xl ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className={`absolute right-0 top-0 h-full w-1 bg-gradient-to-b ${card.gradient}`} />
            <card.icon className={`mb-2 h-5 w-5 ${card.text}`} />
            <p className="text-xs font-medium text-slate-400">{card.label}</p>
            <p className={`mt-1 font-bold ${card.large ? "text-2xl" : "text-xl"} ${card.text}`}>
              {card.value}
            </p>
            {card.sub && (
              <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Revenue Chart — nhận timeline từ summary ── */}
      <RevenueChart
        fromDate={fromDate}
        toDate={toDate}
        groupBy={groupBy}
        summaryTimeline={timeline}
        summaryLoading={summaryQ.isLoading}
      />

      {/* ── Bảng chi tiết theo kỳ (từ timeline) ── */}
      {timeline.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Chi tiết theo kỳ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {fromDate} → {toDate} · {timeline.length} kỳ
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Kỳ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-blue-500">
                    D.thu đơn hàng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-500">
                    D.thu Workshop
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-orange-500">
                    Chi lương
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-amber-500">
                    Chi phụ tùng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-500">
                    Tổng thu
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-violet-500">
                    Lợi nhuận
                  </th>
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
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">
                        {fmt(row.orderRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-cyan-600 dark:text-cyan-400">
                        {fmt(row.workshopRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">
                        {fmt(row.payrollExpense)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">
                        {fmt(row.partsExpense)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {fmt(row.totalRevenue)}
                      </td>
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
              {/* Tổng cộng */}
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    TỔNG CỘNG
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-blue-600 dark:text-blue-400">
                    {fmt(orderRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {fmt(workshopRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-orange-600 dark:text-orange-400">
                    {fmt(payrollExpense)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-amber-600 dark:text-amber-400">
                    {fmt(partsExpense)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {fmt(totalRevenue)}
                  </td>
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
      )}

      {/* ── Payroll breakdown ── */}
      {!payrollQ.isLoading && payrolls.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cột 1: Chi tiết nhân viên */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Top 10 chi phí lương theo nhân viên
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({fromDate} → {toDate})
                </span>
              </h2>
              <div className="space-y-3">
                {payrolls
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
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Cột 2: Chỉ số tổng hợp lương */}
            <div className="border-t border-slate-100 pt-6 md:border-t-0 md:pt-0 md:pl-6 md:border-l md:border-slate-200 dark:border-slate-800">
              <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
                Thống kê chi tiết quỹ lương
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (Từ GET /finance/payroll-summary)
                </span>
              </h2>
              {payrollSummaryQ.isLoading ? (
                <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
                  Đang tải thống kê...
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
                <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
                  Không có dữ liệu quỹ lương.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PayrollTable totalExpense={payrollExpense} fromDate={fromDate} toDate={toDate} />
    </div>
  );
}

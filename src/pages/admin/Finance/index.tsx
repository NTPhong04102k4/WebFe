import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, CalendarRange, RotateCcw } from "lucide-react";
import { useFinanceRevenue, useFinancePayrolls } from "src/query/finance/useFinanceQueries";
import { RevenueChart } from "./RevenueChart";
import { PayrollTable } from "./PayrollTable";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const now = new Date();
const DEFAULT_FROM = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
const DEFAULT_TO = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

function groupByFromRange(from: string, to: string): string {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400_000;
  return days <= 31 ? "Day" : "Month";
}

export default function AdminFinancePage() {
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);

  const isCurrentMonth = fromDate === DEFAULT_FROM && toDate === DEFAULT_TO;

  const revenueQ = useFinanceRevenue({
    fromDate,
    toDate,
    groupBy: groupByFromRange(fromDate, toDate),
  });
  const payrollQ = useFinancePayrolls({ fromDate, toDate, page: 1, pageSize: 1000 });

  const totalRevenue = revenueQ.data?.totalRevenue ?? 0;
  const totalOrders = revenueQ.data?.totalOrders ?? 0;

  const payrolls = payrollQ.data?.data ?? [];
  const totalExpense = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const profit = totalRevenue - totalExpense;

  const handleReset = () => {
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
  };

  const summaryCards = [
    {
      label: "Tổng thu",
      value: revenueQ.isLoading ? "…" : fmt(totalRevenue),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      text: "text-emerald-600",
    },
    {
      label: "Tổng chi lương",
      value: payrollQ.isLoading ? "…" : fmt(totalExpense),
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
      text: "text-red-600",
    },
    {
      label: "Lợi nhuận",
      value: revenueQ.isLoading || payrollQ.isLoading ? "…" : fmt(profit),
      icon: DollarSign,
      gradient: profit >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600",
      text: profit >= 0 ? "text-blue-600" : "text-orange-600",
      large: true,
    },
    {
      label: "Số đơn hàng",
      value: revenueQ.isLoading ? "…" : totalOrders,
      icon: ShoppingBag,
      gradient: "from-purple-500 to-purple-600",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Thu - Chi</h1>
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className={`absolute right-0 top-0 h-full w-1 bg-gradient-to-b ${card.gradient}`} />
            <div className={`mb-2 flex items-center justify-center rounded-lg w-10 h-10 bg-gradient-to-br ${card.gradient} opacity-10`} />
            <card.icon className={`mb-2 h-5 w-5 ${card.text}`} />
            <p className="text-xs font-medium text-slate-400">{card.label}</p>
            <p className={`mt-1 font-bold ${card.large ? "text-2xl" : "text-xl"} ${card.text}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Payroll breakdown */}
      {!payrollQ.isLoading && payrolls.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
            Chi phí lương theo nhân viên
            <span className="ml-2 text-xs font-normal text-slate-400">({fromDate} → {toDate})</span>
          </h2>
          <div className="space-y-2">
            {payrolls
              .sort((a, b) => b.netSalary - a.netSalary)
              .slice(0, 10)
              .map((p) => {
                const pct = totalExpense ? (p.netSalary / totalExpense) * 100 : 0;
                return (
                  <div key={p.payrollID}>
                    <div className="mb-0.5 flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">
                        {p.staffFullName ?? `Staff #${p.staffID}`}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {fmt(p.netSalary)} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <PayrollTable totalExpense={totalExpense} fromDate={fromDate} toDate={toDate} />
    </div>
  );
}

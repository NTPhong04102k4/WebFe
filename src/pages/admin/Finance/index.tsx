import { TrendingUp, CalendarRange, RotateCcw } from "lucide-react";
import { Input } from "src/components/core/Form/Input";

import { RevenueChart } from "./RevenueChart";
import { PayrollTable } from "./PayrollTable";
import { FinanceSummaryCards } from "./components/FinanceSummaryCards";
import { FinanceTimelineTable } from "./components/FinanceTimelineTable";
import { FinancePayrollBreakdown } from "./components/FinancePayrollBreakdown";
import { useFinanceHandler } from "./useFinanceHandler";

export default function AdminFinancePage() {
  const h = useFinanceHandler();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tổng quan Tài chính</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {h.isCurrentMonth ? h.fromDate.slice(0, 7) : `${h.fromDate} → ${h.toDate}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <Input
            type="date"
            value={h.fromDate}
            max={h.toDate}
            onChange={(e) => h.setFromDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-xs text-slate-400">đến</span>
          <Input
            type="date"
            value={h.toDate}
            min={h.fromDate}
            onChange={(e) => h.setToDate(e.target.value)}
            className="w-auto"
          />
          {!h.isCurrentMonth && (
            <button
              onClick={h.handleReset}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Tháng này
            </button>
          )}
        </div>
      </div>

      <FinanceSummaryCards
        isLoading={h.isLoading}
        totalRevenue={h.totalRevenue}
        orderRevenue={h.orderRevenue}
        workshopRevenue={h.workshopRevenue}
        totalExpense={h.totalExpense}
        payrollExpense={h.payrollExpense}
        partsExpense={h.partsExpense}
        grossProfit={h.grossProfit}
        totalOrders={h.totalOrders}
        totalWorkOrders={h.totalWorkOrders}
      />

      <RevenueChart
        fromDate={h.fromDate}
        toDate={h.toDate}
        groupBy={h.groupBy}
        summaryTimeline={h.timeline}
        summaryLoading={h.summaryQ.isLoading}
      />

      <FinanceTimelineTable
        timeline={h.timeline}
        currentPeriodLabel={h.currentPeriodLabel}
        fromDate={h.fromDate}
        toDate={h.toDate}
        orderRevenue={h.orderRevenue}
        workshopRevenue={h.workshopRevenue}
        payrollExpense={h.payrollExpense}
        partsExpense={h.partsExpense}
        totalRevenue={h.totalRevenue}
        grossProfit={h.grossProfit}
      />

      <FinancePayrollBreakdown
        payrolls={h.payrolls}
        payrollExpense={h.payrollExpense}
        fromDate={h.fromDate}
        toDate={h.toDate}
        payrollSummaryQ={h.payrollSummaryQ}
      />

      <PayrollTable totalExpense={h.payrollExpense} fromDate={h.fromDate} toDate={h.toDate} />
    </div>
  );
}

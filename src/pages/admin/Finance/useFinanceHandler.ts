import { useState } from "react";
import {
  useFinanceRevenue,
  useFinancePayrolls,
  useFinanceSummary,
  useFinancePayrollSummary,
} from "src/query/finance/useFinanceQueries";
import { DEFAULT_FROM, DEFAULT_TO, groupByFromRange, toISO } from "./financeHelpers";

export function useFinanceHandler() {
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);

  const isCurrentMonth = fromDate === DEFAULT_FROM && toDate === DEFAULT_TO;
  const groupBy = groupByFromRange(fromDate, toDate);

  const summaryQ = useFinanceSummary({ fromDate, toDate, groupBy });
  const revenueQ = useFinanceRevenue({ fromDate, toDate, groupBy });
  const payrollQ = useFinancePayrolls({ fromDate, toDate, page: 1, pageSize: 1000 });
  const payrollSummaryQ = useFinancePayrollSummary({ fromDate, toDate });

  const summary = summaryQ.data;
  const payrolls = payrollQ.data?.data ?? [];
  const fallbackExpense = payrolls.reduce((s, p) => s + p.netSalary, 0);

  const totalRevenue = summary?.totalRevenue ?? revenueQ.data?.totalRevenue ?? 0;
  const orderRevenue = summary?.orderRevenue ?? revenueQ.data?.totalRevenue ?? 0;
  const workshopRevenue = summary?.workshopRevenue ?? 0;
  const totalExpense = summary?.totalExpense ?? fallbackExpense;
  const payrollExpense = summary?.payrollExpense ?? fallbackExpense;
  const partsExpense = summary?.partsExpense ?? 0;
  const grossProfit = summary?.grossProfit ?? totalRevenue - totalExpense;
  const totalOrders = summary?.totalOrders ?? revenueQ.data?.totalOrders ?? 0;
  const totalWorkOrders = summary?.totalWorkOrders ?? 0;

  const isLoading = summaryQ.isLoading || revenueQ.isLoading;
  const timeline = summary?.timeline ?? [];
  const currentPeriodLabel = toISO(new Date()).slice(0, 7);

  const handleReset = () => {
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
  };

  return {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    isCurrentMonth,
    groupBy,
    isLoading,
    totalRevenue,
    orderRevenue,
    workshopRevenue,
    totalExpense,
    payrollExpense,
    partsExpense,
    grossProfit,
    totalOrders,
    totalWorkOrders,
    timeline,
    currentPeriodLabel,
    payrolls,
    payrollQ,
    payrollSummaryQ,
    summaryQ,
    handleReset,
  };
}

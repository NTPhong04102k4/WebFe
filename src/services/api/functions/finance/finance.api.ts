import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

export interface FinanceSummaryParams {
  fromDate?: string;
  toDate?: string;
  groupBy?: "Day" | "Month";
}

export interface FinanceTimelinePoint {
  label: string;
  orderRevenue: number;
  workshopRevenue: number;
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  payrollExpense: number;
  partsExpense: number;
  grossProfit: number;
}

export interface FinanceSummary {
  orderRevenue: number;
  workshopRevenue: number;
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  payrollExpense: number;
  partsExpense: number;
  totalExpense: number;
  grossProfit: number;
  totalOrders: number;
  totalWorkOrders: number;
  timeline: FinanceTimelinePoint[];
}

export interface PayrollSummaryByPeriod {
  period: string;
  totalBaseSalary: number;
  totalBonus: number;
  totalCommission: number;
  totalNetSalary: number;
}

export interface FinancePayrollSummary {
  totalBaseSalary: number;
  totalBonus: number;
  totalCommission: number;
  totalNetSalary: number;
  totalStaffPaid: number;
  byPeriod: PayrollSummaryByPeriod[];
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const financeApi = {
  /** GET /finance/summary — Admin,SuperAdmin */
  summary: async (params: FinanceSummaryParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get(
      API.finance.summary,
      withSignal({ params }, options)
    );
    return unwrap<FinanceSummary>(res.data);
  },

  /** GET /finance/payroll-summary — Admin,SuperAdmin */
  payrollSummary: async (
    params: { fromDate?: string; toDate?: string },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get(
      API.finance.payrollSummary,
      withSignal({ params }, options)
    );
    return unwrap<FinancePayrollSummary>(res.data);
  },
};

import type { PayrollListParams } from "src/services/api/functions/hr/hr.types";

export const financeKeys = {
  all: ["finance"] as const,
  revenue: (params: object) => [...financeKeys.all, "revenue", params] as const,
  summary: (params: object) => [...financeKeys.all, "summary", params] as const,
  payrollSummary: (params: object) => [...financeKeys.all, "payrollSummary", params] as const,
  payrolls: (params: PayrollListParams) =>
    [...financeKeys.all, "payrolls", params] as const,
  payroll: (id: number) => [...financeKeys.all, "payroll", id] as const,
};

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_STALE_MS, LIST_STALE_MS } from "src/query/queryClient";
import { hrApi } from "src/services/api/functions/hr/hr.api";
import { orderApi } from "src/services/api/functions/orders/order.api";
import { financeApi, type FinanceSummaryParams } from "src/services/api/functions/finance/finance.api";
import type {
  PayrollListParams,
  PayrollRequest,
  PayrollPaymentRequest,
} from "src/services/api/functions/hr/hr.types";
import { financeKeys } from "./keys";

export function useFinanceSummary(params: FinanceSummaryParams) {
  return useQuery({
    queryKey: financeKeys.summary(params),
    queryFn: ({ signal }) => financeApi.summary(params, { signal }),
    staleTime: LIST_STALE_MS,
  });
}

export function useFinancePayrollSummary(params: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: financeKeys.payrollSummary(params),
    queryFn: ({ signal }) => financeApi.payrollSummary(params, { signal }),
    staleTime: LIST_STALE_MS,
  });
}

export function useFinanceRevenue(params: {
  fromDate?: string;
  toDate?: string;
  groupBy?: string;
}) {
  return useQuery({
    queryKey: financeKeys.revenue(params),
    queryFn: ({ signal }) => orderApi.revenue(params, { signal }),
    staleTime: LIST_STALE_MS,
  });
}

export function useFinancePayrolls(params: PayrollListParams) {
  return useQuery({
    queryKey: financeKeys.payrolls(params),
    queryFn: ({ signal }) => hrApi.listPayrolls(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useFinancePayrollMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: financeKeys.all });

  return {
    createPayroll: useMutation({
      mutationFn: (body: PayrollRequest) => hrApi.createPayroll(body),
      onSuccess: invalidate,
    }),
    updatePayroll: useMutation({
      mutationFn: ({ id, body }: { id: number; body: PayrollRequest }) =>
        hrApi.updatePayroll(id, body),
      onSuccess: invalidate,
    }),
    markPaid: useMutation({
      mutationFn: ({ id, body }: { id: number; body: PayrollPaymentRequest }) =>
        hrApi.markPayrollPaid(id, body),
      onSuccess: invalidate,
    }),
    deletePayroll: useMutation({
      mutationFn: (id: number) => hrApi.deletePayroll(id),
      onSuccess: invalidate,
    }),
    recalculatePayroll: useMutation({
      mutationFn: ({ year, month }: { year: number; month: number }) =>
        hrApi.recalculatePayroll(year, month),
      onSuccess: invalidate,
    }),
    previewPayroll: useMutation({
      mutationFn: ({ staffId, year, month }: { staffId: number; year: number; month: number }) =>
        hrApi.previewPayroll(staffId, year, month),
    }),
  };
}

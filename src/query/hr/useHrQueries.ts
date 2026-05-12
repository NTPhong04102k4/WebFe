import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { hrApi } from "src/services/api/functions/hr/hr.api";
import type {
  PayrollListParams,
  PayrollPaymentRequest,
  PayrollRequest,
  TechnicianListParams,
} from "src/services/api/functions/hr/hr.types";

import { hrKeys } from "./keys";

export function useHrSkills() {
  return useQuery({
    queryKey: hrKeys.skills(),
    queryFn: ({ signal }) => hrApi.listSkills({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useHrTechniciansSearch(params: TechnicianListParams) {
  return useQuery({
    queryKey: hrKeys.technicianList(params),
    queryFn: ({ signal }) => hrApi.listTechnicians(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

export function usePayrolls(params: PayrollListParams) {
  return useQuery({
    queryKey: hrKeys.payrolls(params),
    queryFn: ({ signal }) => hrApi.listPayrolls(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function usePayroll(id: number | null) {
  return useQuery({
    queryKey: id != null ? hrKeys.payroll(id) : ["hr", "payroll", "none"],
    queryFn: ({ signal }) => hrApi.getPayroll(id!, { signal }),
    enabled: id != null,
  });
}

export function usePayrollMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: hrKeys.all });

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
    markPayrollPaid: useMutation({
      mutationFn: ({ id, body }: { id: number; body: PayrollPaymentRequest }) =>
        hrApi.markPayrollPaid(id, body),
      onSuccess: invalidate,
    }),
    deletePayroll: useMutation({
      mutationFn: (id: number) => hrApi.deletePayroll(id),
      onSuccess: invalidate,
    }),
  };
}

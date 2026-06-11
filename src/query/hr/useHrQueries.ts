import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { hrApi } from "src/services/api/functions/hr/hr.api";
import type {
  AssignSkillRequest,
  PayrollListParams,
  PayrollPaymentRequest,
  PayrollRequest,
  SkillRequest,
  TechnicianLevelRequest,
  TechnicianListParams,
  TechnicianRequest,
} from "src/services/api/functions/hr/hr.types";

import { hrKeys } from "./keys";

export function useHrSkills() {
  return useQuery({
    queryKey: hrKeys.skills(),
    queryFn: ({ signal }) => hrApi.listSkills({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useHrSkillMutations() {
  const qc = useQueryClient();
  return {
    createSkill: useMutation({
      mutationFn: (body: SkillRequest) => hrApi.createSkill(body),
      onSuccess: () => qc.invalidateQueries({ queryKey: hrKeys.skills() }),
    }),
    updateSkill: useMutation({
      mutationFn: ({ id, body }: { id: number; body: SkillRequest }) =>
        hrApi.updateSkill(id, body),
      onSuccess: () => qc.invalidateQueries({ queryKey: hrKeys.skills() }),
    }),
    deleteSkill: useMutation({
      mutationFn: (id: number) => hrApi.deleteSkill(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: hrKeys.skills() }),
    }),
  };
}

export function useHrTechnicianLevels() {
  return useQuery({
    queryKey: hrKeys.technicianLevels(),
    queryFn: ({ signal }) => hrApi.listTechnicianLevels({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useHrTechnicianLevelMutations() {
  const qc = useQueryClient();
  return {
    createLevel: useMutation({
      mutationFn: (body: TechnicianLevelRequest) =>
        hrApi.createTechnicianLevel(body),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: hrKeys.technicianLevels() }),
    }),
    updateLevel: useMutation({
      mutationFn: ({ id, body }: { id: number; body: TechnicianLevelRequest }) =>
        hrApi.updateTechnicianLevel(id, body),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: hrKeys.technicianLevels() }),
    }),
    deleteLevel: useMutation({
      mutationFn: (id: number) => hrApi.deleteTechnicianLevel(id),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: hrKeys.technicianLevels() }),
    }),
  };
}

export function useHrTechniciansSearch(params: TechnicianListParams) {
  return useQuery({
    queryKey: hrKeys.technicianList(params),
    queryFn: ({ signal }) => hrApi.listTechnicians(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useMyTechnician() {
  return useQuery({
    queryKey: hrKeys.myTechnician(),
    queryFn: ({ signal }) => hrApi.getMyTechnician({ signal }),
    retry: false,
  });
}

export function useHrTechnicianMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: hrKeys.technicians() });

  return {
    createTechnician: useMutation({
      mutationFn: (body: TechnicianRequest) => hrApi.createTechnician(body),
      onSuccess: invalidate,
    }),
    updateTechnician: useMutation({
      mutationFn: ({ id, body }: { id: number; body: TechnicianRequest }) =>
        hrApi.updateTechnician(id, body),
      onSuccess: invalidate,
    }),
    deleteTechnician: useMutation({
      mutationFn: (id: number) => hrApi.deleteTechnician(id),
      onSuccess: invalidate,
    }),
    assignSkill: useMutation({
      mutationFn: ({ id, body }: { id: number; body: AssignSkillRequest }) =>
        hrApi.assignTechnicianSkill(id, body),
      onSuccess: invalidate,
    }),
    removeSkill: useMutation({
      mutationFn: ({ technicianId, skillId }: { technicianId: number; skillId: number }) =>
        hrApi.removeTechnicianSkill(technicianId, skillId),
      onSuccess: invalidate,
    }),
  };
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

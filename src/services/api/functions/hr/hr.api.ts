import apiClient from "@/services/api/axiosInstance";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  AssignSkillRequest,
  PagedResult,
  PayrollListParams,
  PayrollPaymentRequest,
  PayrollPreview,
  PayrollRequest,
  PayrollViewModel,
  SkillRequest,
  SkillViewModel,
  TechnicianLevelRequest,
  TechnicianLevelViewModel,
  TechnicianListParams,
  TechnicianPerformanceViewModel,
  TechnicianRequest,
  TechnicianSkillViewModel,
  TechnicianViewModel,
} from "./hr.types";
import type { OperationResult } from "src/services/types/common.types";

function unwrapOperation<T>(payload: T | OperationResult<T>) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }
  return payload as T;
}

export const hrApi = {
  listSkills: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<SkillViewModel[]>(
      API.hr.skills.list,
      withSignal({}, options)
    );
    return res.data;
  },

  getSkill: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<SkillViewModel>(
      API.hr.skills.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createSkill: async (body: SkillRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<OperationResult<number>>(
      API.hr.skills.list,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  updateSkill: async (id: number, body: SkillRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.put<OperationResult>(
      API.hr.skills.detail(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  deleteSkill: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.delete<OperationResult>(
      API.hr.skills.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  listTechnicianLevels: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<TechnicianLevelViewModel[]>(
      API.hr.technicianLevels.list,
      withSignal({}, options)
    );
    return res.data;
  },

  createTechnicianLevel: async (
    body: TechnicianLevelRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.post<OperationResult<number>>(
      API.hr.technicianLevels.list,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  updateTechnicianLevel: async (
    id: number,
    body: TechnicianLevelRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<OperationResult>(
      API.hr.technicianLevels.detail(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  deleteTechnicianLevel: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.delete<OperationResult>(
      API.hr.technicianLevels.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  listTechnicians: async (
    params: TechnicianListParams,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<PagedResult<TechnicianViewModel>>(
      API.hr.technicians.list,
      withSignal({ params }, options)
    );
    return res.data;
  },

  listAvailableTechnicians: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<TechnicianViewModel[]>(
      API.hr.technicians.available,
      withSignal({}, options)
    );
    return res.data;
  },

  getTechnician: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<TechnicianViewModel>(
      API.hr.technicians.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  getMyTechnician: async (options?: ApiRequestOptions): Promise<TechnicianViewModel | null> => {
    try {
      const res = await apiClient.get<OperationResult<TechnicianViewModel>>(
        API.hr.technicians.me,
        withSignal({ suppressErrorToast: true } as import("axios").AxiosRequestConfig, options)
      );
      return unwrapOperation(res.data) ?? null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  getTechnicianSkills: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<TechnicianSkillViewModel[]>(
      API.hr.technicians.skills(id),
      withSignal({}, options)
    );
    return res.data;
  },

  getTechnicianPerformance: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<TechnicianPerformanceViewModel>(
      API.hr.technicians.performance(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createTechnician: async (body: TechnicianRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<OperationResult<number>>(
      API.hr.technicians.list,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  updateTechnician: async (
    id: number,
    body: TechnicianRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<OperationResult>(
      API.hr.technicians.detail(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  deleteTechnician: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.delete<OperationResult>(
      API.hr.technicians.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  assignTechnicianSkill: async (
    id: number,
    body: AssignSkillRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.post<OperationResult>(
      API.hr.technicians.assignSkill(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  removeTechnicianSkill: async (
    technicianId: number,
    skillId: number,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.delete<OperationResult>(
      API.hr.technicians.removeSkill(technicianId, skillId),
      withSignal({}, options)
    );
    return res.data;
  },

  // ─── Payroll ──────────────────────────────────────────────────────────────

  listPayrolls: async (params: PayrollListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PagedResult<PayrollViewModel>>(
      API.hr.payrolls,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getPayroll: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PayrollViewModel>(
      API.hr.payroll(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createPayroll: async (body: PayrollRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<PayrollViewModel | OperationResult<number>>(
      API.hr.payrolls,
      body,
      withSignal({}, options)
    );
    return unwrapOperation(res.data);
  },

  updatePayroll: async (
    id: number,
    body: PayrollRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<PayrollViewModel | OperationResult>(
      API.hr.payroll(id),
      body,
      withSignal({}, options)
    );
    return unwrapOperation(res.data);
  },

  markPayrollPaid: async (
    id: number,
    body: PayrollPaymentRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.patch<PayrollViewModel | OperationResult>(
      API.hr.payrollPay(id),
      body,
      withSignal({}, options)
    );
    return unwrapOperation(res.data);
  },

  deletePayroll: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.hr.payroll(id), withSignal({}, options));
  },

  /** GET /hr/payrolls/preview?staffId=X&year=Y&month=Z */
  previewPayroll: async (staffId: number, year: number, month: number) => {
    const res = await apiClient.get<OperationResult<PayrollPreview>>(API.hr.payrollPreview, {
      params: { staffId, year, month },
    });
    return res.data;
  },

  /** POST /hr/payrolls/recalculate?year=X&month=Y */
  recalculatePayroll: async (year: number, month: number) => {
    const res = await apiClient.post<OperationResult<{ updated: number; period: string }>>(
      API.hr.payrollRecalculate,
      undefined,
      { params: { year, month } }
    );
    return res.data;
  },
};

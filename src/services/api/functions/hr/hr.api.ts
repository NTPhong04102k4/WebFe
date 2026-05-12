import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  PagedResult,
  PayrollListParams,
  PayrollPaymentRequest,
  PayrollRequest,
  PayrollViewModel,
  SkillViewModel,
  TechnicianListParams,
} from "./hr.types";

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

  listTechnicians: async (
    params: TechnicianListParams,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<PagedResult<unknown>>(
      API.hr.technicians.list,
      withSignal({ params }, options)
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
    const res = await apiClient.post<PayrollViewModel>(
      API.hr.payrolls,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  updatePayroll: async (
    id: number,
    body: PayrollRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<PayrollViewModel>(
      API.hr.payroll(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  markPayrollPaid: async (
    id: number,
    body: PayrollPaymentRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.patch<PayrollViewModel>(
      API.hr.payrollPay(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  deletePayroll: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.hr.payroll(id), withSignal({}, options));
  },
};

import apiClient from "@/services/api/axiosInstance";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  InsuranceCompanyRequest,
  InsuranceCompanyViewModel,
  InsurancePackageRequest,
  InsurancePackageViewModel,
  InsurancePolicyRequest,
  InsurancePolicyViewModel,
  PolicyListResult,
} from "./insurance.types";
import type { OperationResult } from "src/services/types/common.types";

function unwrapOperation<T>(payload: T | OperationResult<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }
  return payload as T;
}

function companyFormData(body: InsuranceCompanyRequest): FormData {
  const fd = new FormData();
  fd.append("companyCode", body.companyCode);
  fd.append("companyName", body.companyName);
  fd.append("hotline", body.hotline ?? "");
  fd.append("email", body.email ?? "");
  fd.append("address", body.address ?? "");
  fd.append("isActive", String(body.isActive));
  if (body.logo) fd.append("logo", body.logo);
  return fd;
}

function policyFormData(fields: InsurancePolicyRequest): FormData {
  const fd = new FormData();
  fd.append("customerVehicleID", String(fields.customerVehicleID));
  fd.append("packageID", String(fields.packageID));
  fd.append("userID", String(fields.userID));
  fd.append("startDate", fields.startDate);
  fd.append("endDate", fields.endDate);
  fd.append("premiumAmount", String(fields.premiumAmount));
  if (fields.soldByStaffID != null) {
    fd.append("soldByStaffID", String(fields.soldByStaffID));
  }
  if (fields.document) {
    fd.append("document", fields.document);
  }
  return fd;
}

export const insuranceApi = {
  listCompanies: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<InsuranceCompanyViewModel[]>(
      API.insurance.companies,
      withSignal({}, options)
    );
    return res.data;
  },

  getCompany: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<InsuranceCompanyViewModel>(
      API.insurance.company(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createCompany: async (body: InsuranceCompanyRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<InsuranceCompanyViewModel | OperationResult<number>>(
      API.insurance.companies,
      companyFormData(body),
      withSignal({}, options)
    );
    return unwrapOperation(res.data);
  },

  updateCompany: async (
    id: number,
    body: InsuranceCompanyRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<InsuranceCompanyViewModel | OperationResult>(
      API.insurance.company(id),
      companyFormData(body),
      withSignal({}, options)
    );
    return unwrapOperation(res.data);
  },

  deleteCompany: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.delete<OperationResult>(API.insurance.company(id), withSignal({}, options));
    return res.data;
  },

  listPackages: async (
    params?: { companyId?: number },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<InsurancePackageViewModel[]>(
      API.insurance.packages,
      withSignal({ params: params ?? {} }, options)
    );
    return res.data;
  },

  getPackage: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<InsurancePackageViewModel>(
      API.insurance.package(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createPackage: async (body: InsurancePackageRequest) => {
    const res = await apiClient.post<InsurancePackageViewModel | OperationResult<number>>(
      API.insurance.packages,
      body
    );
    return unwrapOperation(res.data);
  },

  updatePackage: async (id: number, body: InsurancePackageRequest) => {
    const res = await apiClient.put<InsurancePackageViewModel | OperationResult>(
      API.insurance.package(id),
      body
    );
    return unwrapOperation(res.data);
  },

  deletePackage: async (id: number) => {
    const res = await apiClient.delete<OperationResult>(API.insurance.package(id));
    return res.data;
  },

  listPolicies: async (
    params: {
      page?: number;
      pageSize?: number;
      userId?: string;
      status?: string;
    },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<PolicyListResult>(
      API.insurance.policies,
      withSignal({ params }, options)
    );
    return res.data;
  },

  listExpiringPolicies: async (
    params: { withinDays: number },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<InsurancePolicyViewModel[]>(
      API.insurance.policiesExpiring,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getPolicy: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<InsurancePolicyViewModel>(
      API.insurance.policy(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createPolicy: async (fields: InsurancePolicyRequest) => {
    const fd = policyFormData(fields);
    const res = await apiClient.post<InsurancePolicyViewModel | OperationResult<{ policyID: number; policyNumber: string }>>(
      API.insurance.policies,
      fd
    );
    return unwrapOperation(res.data);
  },

  cancelPolicy: async (id: number) => {
    const res = await apiClient.patch<unknown>(
      API.insurance.policyCancel(id),
      {}
    );
    return res.data;
  },

};

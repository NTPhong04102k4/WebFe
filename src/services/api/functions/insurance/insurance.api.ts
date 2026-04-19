import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  ClaimListResult,
  InsuranceClaimRequest,
  InsuranceClaimStatusRequest,
  InsuranceClaimViewModel,
  InsuranceCompanyViewModel,
  InsurancePackageRequest,
  InsurancePackageViewModel,
  InsurancePolicyViewModel,
  PolicyListResult,
} from "./insurance.types";

function policyFormData(fields: {
  customerVehicleID: number;
  packageID: number;
  userID: number;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  soldByStaffID?: number | null;
  document?: File | null;
}): FormData {
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
    const res = await apiClient.post<InsurancePackageViewModel>(
      API.insurance.packages,
      body
    );
    return res.data;
  },

  updatePackage: async (id: number, body: InsurancePackageRequest) => {
    const res = await apiClient.put<InsurancePackageViewModel>(
      API.insurance.package(id),
      body
    );
    return res.data;
  },

  deletePackage: async (id: number) => {
    await apiClient.delete(API.insurance.package(id));
  },

  listPolicies: async (
    params: {
      page?: number;
      pageSize?: number;
      userId?: number;
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

  createPolicy: async (fields: {
    customerVehicleID: number;
    packageID: number;
    userID: number;
    startDate: string;
    endDate: string;
    premiumAmount: number;
    soldByStaffID?: number | null;
    document?: File | null;
  }) => {
    const fd = policyFormData(fields);
    const res = await apiClient.post<InsurancePolicyViewModel>(
      API.insurance.policies,
      fd
    );
    return res.data;
  },

  cancelPolicy: async (id: number) => {
    const res = await apiClient.patch<unknown>(
      API.insurance.policyCancel(id),
      {}
    );
    return res.data;
  },

  listClaims: async (
    params: { page?: number; pageSize?: number; status?: string },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<ClaimListResult>(
      API.insurance.claims,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getClaim: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<InsuranceClaimViewModel>(
      API.insurance.claim(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createClaim: async (body: InsuranceClaimRequest) => {
    const res = await apiClient.post<InsuranceClaimViewModel>(
      API.insurance.claims,
      body
    );
    return res.data;
  },

  patchClaimStatus: async (id: number, body: InsuranceClaimStatusRequest) => {
    const res = await apiClient.patch<unknown>(
      API.insurance.claimStatus(id),
      body
    );
    return res.data;
  },
};

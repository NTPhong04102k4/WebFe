import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { insuranceApi } from "src/services/api/functions/insurance/insurance.api";
import type {
  InsuranceCompanyRequest,
  InsuranceClaimRequest,
  InsuranceClaimStatusRequest,
  InsurancePackageRequest,
  InsurancePolicyRequest,
} from "src/services/api/functions/insurance/insurance.types";

import { insuranceKeys } from "./keys";

export function useInsuranceCompanies() {
  return useQuery({
    queryKey: insuranceKeys.companies(),
    queryFn: ({ signal }) => insuranceApi.listCompanies({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useInsurancePackages(companyId?: number) {
  return useQuery({
    queryKey: insuranceKeys.packages(companyId),
    queryFn: ({ signal }) =>
      insuranceApi.listPackages(
        companyId != null ? { companyId } : undefined,
        { signal }
      ),
    staleTime: 5 * 60_000,
  });
}

export function useMyPolicies(userId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: insuranceKeys.policies(userId),
    queryFn: ({ signal }) =>
      insuranceApi.listPolicies(
        { page, pageSize, userId },
        { signal }
      ),
    enabled: userId != null,
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useInsurancePolicies(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: insuranceKeys.policies(params),
    queryFn: ({ signal }) => insuranceApi.listPolicies(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useExpiringPolicies(withinDays: number, enabled = true) {
  return useQuery({
    queryKey: insuranceKeys.expiring(withinDays),
    queryFn: ({ signal }) =>
      insuranceApi.listExpiringPolicies({ withinDays }, { signal }),
    enabled,
    staleTime: SEARCH_STALE_MS,
  });
}

export function useInsuranceCompanyMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: insuranceKeys.companies() });

  return {
    createCompany: useMutation({
      mutationFn: (body: InsuranceCompanyRequest) =>
        insuranceApi.createCompany(body),
      onSuccess: invalidate,
    }),
    updateCompany: useMutation({
      mutationFn: ({ id, body }: { id: number; body: InsuranceCompanyRequest }) =>
        insuranceApi.updateCompany(id, body),
      onSuccess: invalidate,
    }),
    deleteCompany: useMutation({
      mutationFn: (id: number) => insuranceApi.deleteCompany(id),
      onSuccess: invalidate,
    }),
  };
}

export function useInsuranceMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: insuranceKeys.all });

  return {
    createPolicy: useMutation({
      mutationFn: (body: InsurancePolicyRequest) => insuranceApi.createPolicy(body),
      onSuccess: invalidate,
    }),
    cancelPolicy: useMutation({
      mutationFn: (id: number) => insuranceApi.cancelPolicy(id),
      onSuccess: invalidate,
    }),
    createPackage: useMutation({
      mutationFn: (body: InsurancePackageRequest) =>
        insuranceApi.createPackage(body),
      onSuccess: invalidate,
    }),
    updatePackage: useMutation({
      mutationFn: ({ id, body }: { id: number; body: InsurancePackageRequest }) =>
        insuranceApi.updatePackage(id, body),
      onSuccess: invalidate,
    }),
    deletePackage: useMutation({
      mutationFn: (id: number) => insuranceApi.deletePackage(id),
      onSuccess: invalidate,
    }),
  };
}

// ── Claims ───────────────────────────────────────────────────────────────────

export function useInsuranceClaims(params: {
  page?: number;
  pageSize?: number;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: insuranceKeys.claims(params),
    queryFn: ({ signal }) => insuranceApi.listClaims(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useInsuranceClaimMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: insuranceKeys.claims() });

  return {
    createClaim: useMutation({
      mutationFn: (body: InsuranceClaimRequest) => insuranceApi.createClaim(body),
      onSuccess: invalidate,
    }),
    updateClaimStatus: useMutation({
      mutationFn: ({ id, body }: { id: number; body: InsuranceClaimStatusRequest }) =>
        insuranceApi.updateClaimStatus(id, body),
      onSuccess: invalidate,
    }),
  };
}

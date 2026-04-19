import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { insuranceApi } from "src/services/api/functions/insurance/insurance.api";
import type {
  InsuranceClaimRequest,
  InsuranceClaimStatusRequest,
  InsurancePackageRequest,
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

export function useMyPolicies(userId: number | undefined, page = 1, pageSize = 20) {
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

export function useExpiringPolicies(withinDays: number, enabled = true) {
  return useQuery({
    queryKey: insuranceKeys.expiring(withinDays),
    queryFn: ({ signal }) =>
      insuranceApi.listExpiringPolicies({ withinDays }, { signal }),
    enabled,
    staleTime: SEARCH_STALE_MS,
  });
}

export function useClaimsList(page = 1, pageSize = 20, status?: string) {
  return useQuery({
    queryKey: insuranceKeys.claims(status),
    queryFn: ({ signal }) =>
      insuranceApi.listClaims({ page, pageSize, status }, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useInsuranceMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: insuranceKeys.all });

  return {
    createPolicy: useMutation({
      mutationFn: insuranceApi.createPolicy,
      onSuccess: invalidate,
    }),
    cancelPolicy: useMutation({
      mutationFn: (id: number) => insuranceApi.cancelPolicy(id),
      onSuccess: invalidate,
    }),
    createClaim: useMutation({
      mutationFn: (body: InsuranceClaimRequest) =>
        insuranceApi.createClaim(body),
      onSuccess: invalidate,
    }),
    patchClaimStatus: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: InsuranceClaimStatusRequest;
      }) => insuranceApi.patchClaimStatus(id, body),
      onSuccess: invalidate,
    }),
    createPackage: useMutation({
      mutationFn: (body: InsurancePackageRequest) =>
        insuranceApi.createPackage(body),
      onSuccess: invalidate,
    }),
  };
}

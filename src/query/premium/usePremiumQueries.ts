import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "src/services/api/functions/premium/premium.api";
import type {
  AdminSubscriptionsQuery,
  PremiumPlanCreateRequest,
  PremiumPlanUpdateRequest,
  SubscribeRequest,
} from "src/services/api/functions/premium/premium.types";
import { premiumKeys } from "./keys";

export function usePremiumPlans() {
  return useQuery({
    queryKey: premiumKeys.plans(),
    queryFn: ({ signal }) => premiumApi.getAllPlans({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useMySubscription(enabled = true) {
  return useQuery({
    queryKey: premiumKeys.mySubscription(),
    queryFn: ({ signal }) => premiumApi.getMySubscription({ signal }),
    enabled,
    staleTime: 30_000,
  });
}

export function usePremiumMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: premiumKeys.mySubscription() });

  return {
    subscribe: useMutation({
      mutationFn: (req: SubscribeRequest) => premiumApi.subscribe(req),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: () => premiumApi.cancelSubscription(),
      onSuccess: invalidate,
    }),
    renew: useMutation({
      mutationFn: () => premiumApi.renewSubscription(),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminSubscriptions(query: AdminSubscriptionsQuery = {}) {
  return useQuery({
    queryKey: premiumKeys.adminSubscriptions(query),
    queryFn: ({ signal }) => premiumApi.adminGetSubscriptions(query, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserSubscription(userId: string | number | null) {
  return useQuery({
    queryKey: userId != null ? premiumKeys.adminUserSubscription(userId) : ["premium", "admin-user-subscription", "none"],
    queryFn: ({ signal }) => premiumApi.adminGetUserSubscription(userId!, { signal }),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useAdminPremiumMutations() {
  const qc = useQueryClient();
  const invalidatePlans = () => qc.invalidateQueries({ queryKey: premiumKeys.plans() });

  return {
    createPlan: useMutation({
      mutationFn: (req: PremiumPlanCreateRequest) => premiumApi.adminCreatePlan(req),
      onSuccess: invalidatePlans,
    }),
    updatePlan: useMutation({
      mutationFn: ({ id, req }: { id: number; req: PremiumPlanUpdateRequest }) =>
        premiumApi.adminUpdatePlan(id, req),
      onSuccess: invalidatePlans,
    }),
    deletePlan: useMutation({
      mutationFn: (id: number) => premiumApi.adminDeletePlan(id),
      onSuccess: invalidatePlans,
    }),
  };
}

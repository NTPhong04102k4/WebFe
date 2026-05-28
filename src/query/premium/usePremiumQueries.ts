import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "src/services/api/functions/premium/premium.api";
import type {
  AdminSubscriptionsQuery,
  PremiumPlanCreateRequest,
  PremiumPlanUpdateRequest,
  SubscribeRequest,
} from "src/services/api/functions/premium/premium.types";
import { premiumKeys } from "./keys";
import { useAuthStore } from "@/stores/authStore";

/** GET /premium-plans — Public */
export function usePremiumPlans() {
  return useQuery({
    queryKey: premiumKeys.plans(),
    queryFn: ({ signal }) => premiumApi.getAllPlans({ signal }),
    staleTime: 5 * 60_000,
  });
}

/** GET /premium-plans/my-subscription — Customer only */
export function useMySubscription() {
  const isCustomer = useAuthStore((s) => s.user?.role === "Customer");
  return useQuery({
    queryKey: premiumKeys.mySubscription(),
    queryFn: ({ signal }) => premiumApi.getMySubscription({ signal }),
    enabled: isCustomer,
    staleTime: 5 * 60_000,
    gcTime: 60_000,
    retry: (count, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return count < 1;
    },
  });
}

/** Mutations cho Customer: subscribe, cancel, renew */
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

/**
 * GET /premium-plans/admin/subscriptions
 * Restored: backend đã implement trong commit feat/manage revenue premium plans
 */
export function useAdminSubscriptions(query: AdminSubscriptionsQuery = {}) {
  return useQuery({
    queryKey: premiumKeys.adminSubscriptions(query),
    queryFn: ({ signal }) => premiumApi.adminGetSubscriptions(query, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/** Admin CRUD mutations */
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

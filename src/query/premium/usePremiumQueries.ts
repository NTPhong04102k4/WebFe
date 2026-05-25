import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "src/services/api/functions/premium/premium.api";
import type { SubscribeRequest } from "src/services/api/functions/premium/premium.types";
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

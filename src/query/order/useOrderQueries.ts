import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_STALE_MS } from "src/query/queryClient";
import {
  orderApi,
  type AdminOrderListParams,
} from "src/services/api/functions/orders/order.api";
import { orderKeys } from "./keys";

export function useAdminOrders(params: AdminOrderListParams) {
  return useQuery({
    queryKey: orderKeys.adminList(params),
    queryFn: ({ signal }) => orderApi.list(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useOrderDetail(orderNumber: string | null) {
  return useQuery({
    queryKey: orderNumber ? orderKeys.detail(orderNumber) : ["orders", "detail", "none"],
    queryFn: ({ signal }) => orderApi.detail(orderNumber!, { signal }),
    enabled: orderNumber != null,
  });
}

export function useRevenue(params: { fromDate?: string; toDate?: string; groupBy?: string }) {
  return useQuery({
    queryKey: orderKeys.revenue(params),
    queryFn: ({ signal }) => orderApi.revenue(params, { signal }),
    staleTime: 5 * 60_000,
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: orderKeys.all });

  return {
    updateStatus: useMutation({
      mutationFn: ({ orderNumber, status }: { orderNumber: string; status: string }) =>
        orderApi.updateStatus(orderNumber, status),
      onSuccess: invalidate,
    }),
  };
}

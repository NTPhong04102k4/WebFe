import { useQuery } from "@tanstack/react-query";
import { sepayAPI } from "src/services/api/functions/Payment/sepayClient";
import { paymentKeys } from "./keys";

export function useSePayOrder(
  orderId: string | null | undefined,
  enabled?: boolean
) {
  return useQuery({
    queryKey: paymentKeys.order(orderId ?? ""),
    queryFn: () => {
      if (!orderId) throw new Error("Order ID is required");
      return sepayAPI.getOrderDetail(orderId);
    },
    enabled: enabled !== undefined ? enabled : !!orderId,
    staleTime: 5 * 60_000,
    retry: 2,
    retryDelay: 1000,
  });
}

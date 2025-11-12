import { useQuery } from "@tanstack/react-query";
import { sepayAPI } from "src/services/api/functions/Payment/sepayClient";
import { SePayOrderDetailResponse } from "src/shared/types/Reponse/Payment";

/**
 * Hook để truy vấn chi tiết đơn hàng SePay
 * @param orderId - ID đơn hàng SePay (Ví dụ: SEPAY-68BA83CE637C1)
 * @param enabled - Có bật query không (mặc định: true nếu có orderId)
 */
export const useSePayOrder = (
  orderId: string | null | undefined,
  enabled?: boolean
) => {
  return useQuery<SePayOrderDetailResponse, Error>({
    queryKey: ["sepay-order", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return sepayAPI.getOrderDetail(orderId);
    },
    enabled: enabled !== undefined ? enabled : !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

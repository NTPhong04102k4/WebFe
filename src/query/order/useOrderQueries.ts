import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_STALE_MS } from "src/query/queryClient";
import {
  orderApi,
  type AdminOrderListParams,
  type RecordCashInput,
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

export function useMyOrders(params: Pick<AdminOrderListParams, "page" | "pageSize"> = { page: 1, pageSize: 20 }) {
  return useQuery({
    queryKey: orderKeys.myOrders(params),
    queryFn: ({ signal }) => orderApi.myOrders(params, { signal }),
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

export function useOrderPaymentInfo(orderNumber: string | null, enabled = true) {
  return useQuery({
    queryKey: orderNumber ? orderKeys.paymentInfo(orderNumber) : ["orders", "payment-info", "none"],
    queryFn: ({ signal }) => orderApi.paymentInfo(orderNumber!, { signal }),
    enabled: orderNumber != null && enabled,
    retry: false,
  });
}

/**
 * Đối soát thanh toán online — trả về `CheckPaymentApiResponse` (success/errorCode/data).
 * Khi có giao dịch mới (dù partial), invalidate order detail để UI cập nhật badge status.
 */
export function useCheckPayment(orderNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orderApi.checkPayment(orderNumber),
    onSuccess: (result) => {
      // Invalidate nếu trạng thái thực sự thay đổi (Paid hoặc PartialPaid có giao dịch mới)
      const changed = result.success || (result.data && (result.data.newTransactions ?? 0) > 0);
      if (changed) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) });
      }
    },
  });
}

/**
 * Ghi tiền mặt — Staff/Admin/Sales only.
 * Invalidate order detail sau khi ghi thành công.
 */
export function useRecordCash(orderNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordCashInput) => orderApi.recordCash(orderNumber, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) });
    },
  });
}

export function useRevenue(params: { fromDate?: string; toDate?: string; groupBy?: string }) {
  return useQuery({
    queryKey: orderKeys.revenue(params),
    queryFn: ({ signal }) => orderApi.revenue(params, { signal }),
    staleTime: 5 * 60_000,
  });
}

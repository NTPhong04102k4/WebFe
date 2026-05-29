import type { AdminOrderListParams } from "src/services/api/functions/orders/order.api";

export const orderKeys = {
  all: ["orders"] as const,
  adminList: (params: AdminOrderListParams) =>
    [...orderKeys.all, "admin-list", params] as const,
  myOrders: (params: object) => [...orderKeys.all, "my-orders", params] as const,
  detail: (orderNumber: string) =>
    [...orderKeys.all, "detail", orderNumber] as const,
  paymentInfo: (orderNumber: string) =>
    [...orderKeys.all, "payment-info", orderNumber] as const,
  revenue: (params: object) => [...orderKeys.all, "revenue", params] as const,
};

export const paymentKeys = {
  all: ["payment"] as const,
  orders: () => [...paymentKeys.all, "order"] as const,
  order: (orderId: string) => [...paymentKeys.orders(), orderId] as const,
};

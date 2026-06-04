export const premiumKeys = {
  all: ["premium"] as const,
  plans: (q?: { isActive?: boolean }) => [...premiumKeys.all, "plans", q] as const,
  mySubscription: () => [...premiumKeys.all, "my-subscription"] as const,
  mySubscriptionHistory: (q?: { page?: number; pageSize?: number }) =>
    [...premiumKeys.all, "my-subscription-history", q] as const,
  adminSubscriptions: (q?: object) => [...premiumKeys.all, "admin-subscriptions", q] as const,
  adminUserSubscription: (userId: string | number) => [...premiumKeys.all, "admin-user-subscription", userId] as const,
};

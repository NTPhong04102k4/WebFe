export const premiumKeys = {
  all: ["premium"] as const,
  plans: () => [...premiumKeys.all, "plans"] as const,
  mySubscription: () => [...premiumKeys.all, "my-subscription"] as const,
  adminSubscriptions: (q?: object) => [...premiumKeys.all, "admin-subscriptions", q] as const,
  adminUserSubscription: (userId: string | number) => [...premiumKeys.all, "admin-user-subscription", userId] as const,
};

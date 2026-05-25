export const premiumKeys = {
  all: ["premium"] as const,
  plans: () => [...premiumKeys.all, "plans"] as const,
  mySubscription: () => [...premiumKeys.all, "my-subscription"] as const,
};

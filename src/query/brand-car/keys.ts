export const brandCarKeys = {
  all: ["brand-cars"] as const,
  lists: () => [...brandCarKeys.all, "list"] as const,
};

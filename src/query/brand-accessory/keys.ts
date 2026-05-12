export const brandAccessoryKeys = {
  all: ["brand-accessories"] as const,
  lists: () => [...brandAccessoryKeys.all, "list"] as const,
};

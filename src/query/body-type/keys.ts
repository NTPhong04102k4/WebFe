export const bodyTypeKeys = {
  all: ["body-types"] as const,
  lists: () => [...bodyTypeKeys.all, "list"] as const,
};

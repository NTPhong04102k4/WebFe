export const serviceCategoryKeys = {
  all: ["service-categories"] as const,
  lists: () => [...serviceCategoryKeys.all, "list"] as const,
  details: () => [...serviceCategoryKeys.all, "detail"] as const,
  detail: (id: number) => [...serviceCategoryKeys.details(), id] as const,
};

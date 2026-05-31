export const insuranceKeys = {
  all: ["insurance"] as const,
  companies: () => [...insuranceKeys.all, "companies"] as const,
  packages: (companyId?: number) =>
    [...insuranceKeys.all, "packages", { companyId }] as const,
  policies: (params?: { page?: number; pageSize?: number; userId?: string; status?: string }) =>
    [...insuranceKeys.all, "policies", params ?? {}] as const,
  expiring: (withinDays: number) =>
    [...insuranceKeys.all, "expiring", withinDays] as const,
};

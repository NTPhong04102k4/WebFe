export const insuranceKeys = {
  all: ["insurance"] as const,
  companies: () => [...insuranceKeys.all, "companies"] as const,
  packages: (companyId?: number) =>
    [...insuranceKeys.all, "packages", { companyId }] as const,
  policies: (userId?: number) =>
    [...insuranceKeys.all, "policies", { userId }] as const,
  expiring: (withinDays: number) =>
    [...insuranceKeys.all, "expiring", withinDays] as const,
  claims: (status?: string) =>
    [...insuranceKeys.all, "claims", { status }] as const,
};

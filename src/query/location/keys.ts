export const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (ip: string) => [...locationKeys.details(), ip] as const,
};

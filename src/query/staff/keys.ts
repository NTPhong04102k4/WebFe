import type { StaffListQuery } from "src/services/api/functions/staff/staff.types";

export const staffKeys = {
  all: ["staff"] as const,
  list: (query: StaffListQuery) => [...staffKeys.all, "list", query] as const,
  detail: (staffId: number) => [...staffKeys.all, "detail", staffId] as const,
};

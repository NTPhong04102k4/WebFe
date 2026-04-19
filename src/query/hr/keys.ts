import type { TechnicianListParams } from "src/services/api/functions/hr/hr.types";

export const hrKeys = {
  all: ["hr"] as const,
  skills: () => [...hrKeys.all, "skills"] as const,
  skill: (id: number) => [...hrKeys.skills(), "detail", id] as const,
  technicians: () => [...hrKeys.all, "technicians"] as const,
  technicianList: (params: TechnicianListParams) =>
    [...hrKeys.technicians(), "list", params] as const,
};

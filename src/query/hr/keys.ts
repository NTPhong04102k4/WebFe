import type {
  PayrollListParams,
  TechnicianListParams,
} from "src/services/api/functions/hr/hr.types";

export const hrKeys = {
  all: ["hr"] as const,
  skills: () => [...hrKeys.all, "skills"] as const,
  skill: (id: number) => [...hrKeys.skills(), "detail", id] as const,
  technicianLevels: () => [...hrKeys.all, "technician-levels"] as const,
  technicians: () => [...hrKeys.all, "technicians"] as const,
  technicianList: (params: TechnicianListParams) =>
    [...hrKeys.technicians(), "list", params] as const,
  payrolls: (params: PayrollListParams) =>
    [...hrKeys.all, "payrolls", params] as const,
  payroll: (id: number) => [...hrKeys.all, "payroll", id] as const,
};

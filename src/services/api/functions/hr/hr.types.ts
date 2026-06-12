/** HR view models — theo docs/api/modules/hr.md (camelCase khi JSON). */
export interface SkillViewModel {
  skillID: number;
  skillCode: string;
  skillName: string;
  description?: string;
  category?: string;
  isActive: boolean;
}

export interface SkillRequest {
  skillCode: string;
  skillName: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
}

export interface TechnicianLevelRequest {
  levelCode: string;
  levelName: string;
  baseSalary: number;
  hourlyRate: number;
  bonusPerJob?: number | null;
  displayOrder?: number;
}

export interface TechnicianLevelViewModel {
  levelID: number;
  levelCode: string;
  levelName: string;
  baseSalary: number;
  hourlyRate: number;
  bonusPerJob?: number | null;
  displayOrder: number;
}

export interface TechnicianListParams {
  page?: number;
  pageSize?: number;
  available?: boolean;
}

/** Phân trang thường gặp từ backend */
export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TechnicianRequest {
  staffID: number;
  levelID: number;
  hireDate: string;
  certifications?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface AssignSkillRequest {
  skillID: number;
  proficiencyLevel: number;
  certifiedDate?: string | null;
  expiryDate?: string | null;
}

export interface TechnicianSkillViewModel {
  technicianSkillID: number;
  skillID: number;
  skillCode?: string | null;
  skillName?: string | null;
  proficiencyLevel: number;
  certifiedDate?: string | null;
  expiryDate?: string | null;
}

export interface TechnicianViewModel {
  technicianID: number;
  staffID: number;
  staffFullName?: string | null;
  staffEmail?: string | null;
  locationID: number;
  levelID: number;
  levelName?: string | null;
  hireDate: string;
  yearsOfExperience: number;
  certifications?: string | null;
  isAvailable: boolean;
  currentWorkload: number;
  totalJobsCompleted: number;
  averageRating?: number | null;
  notes?: string | null;
  isActive: boolean;
  skills?: TechnicianSkillViewModel[] | null;
}

export interface TechnicianPerformanceViewModel {
  technicianID: number;
  staffFullName?: string | null;
  currentWorkload: number;
  totalJobsCompleted: number;
  averageRating?: number | null;
  completedThisMonth: number;
  totalRevenueGenerated: number;
}

// ─── Payroll ────────────────────────────────────────────────────────────────

export interface PayrollListParams {
  page?: number;
  pageSize?: number;
  staffId?: number;
  fromDate?: string;
  toDate?: string;
  period?: any;
}

export interface PayrollRequest {
  staffID: number;
  payPeriod: string;
  baseSalary: number;
  workingHours: number;
  overtimeHours: number;
  jobsCompleted: number;
  commissionAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  taxAmount: number;
  notes?: string | null;
}

export interface PayrollPreview {
  staffID: number;
  baseSalary: number;
  workingHours: number;
  jobsCompleted: number;
  commissionAmount: number;
  bonusAmount: number;
}

export interface PayrollPaymentRequest {
  paymentStatus: "Pending" | "Paid";
  paidDate?: string | null;
}

export interface PayrollViewModel {
  payrollID: number;
  staffID: number;
  staffFullName?: string | null;
  payPeriod: string;
  baseSalary: number;
  workingHours: number;
  overtimeHours: number;
  jobsCompleted: number;
  commissionAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  grossSalary: number;
  taxAmount: number;
  netSalary: number;
  paymentStatus: string;
  paidDate?: string | null;
  notes?: string | null;
}

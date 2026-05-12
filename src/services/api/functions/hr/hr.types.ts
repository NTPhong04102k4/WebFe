/** HR view models — theo docs/api/modules/hr.md (camelCase khi JSON). */
export interface SkillViewModel {
  skillID: number;
  skillCode: string;
  skillName: string;
  description?: string;
  category?: string;
  isActive: boolean;
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

// ─── Payroll ────────────────────────────────────────────────────────────────

export interface PayrollListParams {
  page?: number;
  pageSize?: number;
  staffId?: number;
  month?: number;
  year?: number;
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

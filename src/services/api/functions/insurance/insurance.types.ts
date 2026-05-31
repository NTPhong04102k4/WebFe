import type { PagedResult } from "../hr/hr.types";

export type { PagedResult } from "../hr/hr.types";

export interface InsuranceCompanyRequest {
  companyCode: string;
  companyName: string;
  hotline?: string | null;
  email?: string | null;
  address?: string | null;
  logo?: File | null;
  isActive: boolean;
}

export interface InsuranceCompanyViewModel {
  companyID: number;
  companyCode: string;
  companyName: string;
  hotline?: string | null;
  email?: string | null;
  address?: string | null;
  logoPath?: string | null;
  isActive: boolean;
}

export interface InsurancePackageRequest {
  companyID: number;
  packageCode: string;
  packageName: string;
  packageType: string;
  description?: string | null;
  coverageAmount: number;
  basePremium: number;
  duration_months: number;
  isActive: boolean;
}

export interface InsurancePackageViewModel {
  packageID: number;
  companyID: number;
  companyName?: string | null;
  packageCode: string;
  packageName: string;
  packageType: string;
  description?: string | null;
  coverageAmount: number;
  basePremium: number;
  duration_months: number;
  isActive: boolean;
}

export interface InsurancePolicyViewModel {
  policyID: number;
  policyNumber: string;
  customerVehicleID: number;
  vehicleInfo?: string | null;
  packageID: number;
  packageName?: string | null;
  companyName?: string | null;
  userID: string;
  ownerFullName?: string | null;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  paymentStatus: string;
  status: string;
  documentPath?: string | null;
  soldByStaffID?: number | null;
  soldByStaffName?: string | null;
  createdDate: string;
  daysToExpire: number;
}

export interface InsurancePolicyRequest {
  customerVehicleID: number;
  packageID: number;
  userID: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  soldByStaffID?: number | null;
  document?: File | null;
}

export type PolicyListResult = PagedResult<InsurancePolicyViewModel>;

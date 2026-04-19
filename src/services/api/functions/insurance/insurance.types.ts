import type { PagedResult } from "../hr/hr.types";

export type { PagedResult } from "../hr/hr.types";

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
  userID: number;
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

export interface InsuranceClaimRequest {
  policyID: number;
  workOrderID?: number | null;
  incidentDate: string;
  reportedDate: string;
  description: string;
  claimAmount: number;
}

export interface InsuranceClaimStatusRequest {
  status: string;
  approvedAmount?: number | null;
  notes?: string | null;
}

export interface InsuranceClaimViewModel {
  claimID: number;
  claimNumber: string;
  policyID: number;
  policyNumber?: string | null;
  workOrderID?: number | null;
  workOrderNumber?: string | null;
  incidentDate: string;
  reportedDate: string;
  description: string;
  claimAmount: number;
  approvedAmount?: number | null;
  status: string;
  processedDate?: string | null;
  notes?: string | null;
  createdDate: string;
}

export type PolicyListResult = PagedResult<InsurancePolicyViewModel>;
export type ClaimListResult = PagedResult<InsuranceClaimViewModel>;

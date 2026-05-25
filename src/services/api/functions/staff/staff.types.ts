import type { OperationResult } from "src/services/types/common.types";
import type { PagedResult } from "../hr/hr.types";

export interface StaffListQuery {
  page?: number;
  pageSize?: number;
  roleID?: number | null;
  locationID?: number | null;
  isActive?: boolean | null;
  keyword?: string | null;
}

export interface CreateStaffRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  locationID: number;
  roleID: number;
  createBy: number;
}

export interface UpdateStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  locationID: number;
  roleID: number;
}

export interface UpdateStaffPasswordRequest {
  currentPassword?: string | null;
  newPassword: string;
}

export interface StaffStatusRequest {
  isActive: boolean;
}

export interface SuperAdminRecoverPasswordRequest {
  recoveryCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StaffResponse {
  staffID?: number;
  id?: number;
  username: string;
  fullName: string;
  email: string;
  role?: string;
  roleName?: string;
  roleID?: number | null;
  location?: string;
  locationName?: string;
  locationID?: number | null;
  phone: string;
  staffCode: string;
  isActive?: boolean;
  createdDate?: string | null;
}

export type StaffListResult = PagedResult<StaffResponse>;
export type StaffOperationResult<T = unknown> = OperationResult<T>;

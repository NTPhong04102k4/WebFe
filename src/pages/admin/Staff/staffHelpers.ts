import type { StaffResponse } from "src/services/api/functions/staff/staff.types";
import type { LocationResponse } from "src/shared/types/Reponse/Location";

export type StaffForm = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  locationID: string;
  roleID: string;
};

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
};

export type RecoveryForm = {
  recoveryCode: string;
  newPassword: string;
  confirmPassword: string;
};

export type LocationOption = LocationResponse & {
  locationID?: number;
  id?: number;
};

export const ROLE_OPTIONS = [
  { value: "1", label: "SuperAdmin" },
  { value: "2", label: "Admin" },
  { value: "3", label: "Staff" },
] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const staffDefaults: StaffForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  locationID: "",
  roleID: "3",
};

export function staffIdOf(staff: StaffResponse) {
  return staff.staffID ?? staff.id ?? 0;
}

export function locationIdOf(location: LocationOption, index: number) {
  return location.locationID ?? location.id ?? index + 1;
}

export function isActiveStaff(staff: StaffResponse) {
  return staff.isActive !== false;
}

export function roleNameOf(staff: StaffResponse) {
  return staff.roleName ?? staff.role ?? `Role #${staff.roleID ?? "-"}`;
}

export function locationNameOf(staff: StaffResponse) {
  return staff.locationName ?? staff.location ?? `Location #${staff.locationID ?? "-"}`;
}

export function sameStaff(currentUserId: number | undefined, staff: StaffResponse) {
  return currentUserId != null && currentUserId === staffIdOf(staff);
}

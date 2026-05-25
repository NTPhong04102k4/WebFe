import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type {
  CreateStaffRequest,
  StaffListQuery,
  StaffListResult,
  StaffOperationResult,
  StaffResponse,
  StaffStatusRequest,
  SuperAdminRecoverPasswordRequest,
  UpdateStaffPasswordRequest,
  UpdateStaffRequest,
} from "./staff.types";

function compactParams(params: StaffListQuery) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export const staffApi = {
  list: async (params: StaffListQuery, options?: ApiRequestOptions) => {
    const res = await apiClient.get<StaffListResult>(
      API.auth.adminStaff,
      withSignal({ params: compactParams(params) }, options)
    );
    return res.data;
  },

  detail: async (staffId: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<StaffResponse>(
      API.auth.adminStaffDetail(staffId),
      withSignal({}, options)
    );
    return res.data;
  },

  create: async (body: CreateStaffRequest) => {
    const res = await apiClient.post<StaffOperationResult<StaffResponse>>(
      API.auth.adminStaffCreate,
      body
    );
    return res.data;
  },

  update: async (staffId: number, body: UpdateStaffRequest) => {
    const res = await apiClient.put<StaffOperationResult<StaffResponse>>(
      API.auth.adminStaffDetail(staffId),
      body
    );
    return res.data;
  },

  updatePassword: async (staffId: number, body: UpdateStaffPasswordRequest) => {
    const res = await apiClient.put<StaffOperationResult>(
      API.auth.adminStaffPassword(staffId),
      body
    );
    return res.data;
  },

  patchStatus: async (staffId: number, body: StaffStatusRequest) => {
    const res = await apiClient.patch<StaffOperationResult>(
      API.auth.adminStaffStatus(staffId),
      body
    );
    return res.data;
  },

  delete: async (staffId: number) => {
    const res = await apiClient.delete<StaffOperationResult>(
      API.auth.adminStaffDetail(staffId)
    );
    return res.data;
  },

  recoverSuperAdminPassword: async (body: SuperAdminRecoverPasswordRequest) => {
    const res = await apiClient.post<StaffOperationResult<{ username: string }>>(
      API.auth.superAdminRecoverPassword,
      body
    );
    return res.data;
  },
};

import api from "@/services/api/axiosInstance";
import type { OperationResult } from "src/services/types/common.types";
import type {
  PagedUsersResponse,
  UserListQuery,
  UserProfile,
} from "src/shared/types/Reponse/auth/user";

import { userRoute } from "./Routes";

type AdminUsersPayload =
  | PagedUsersResponse
  | OperationResult<PagedUsersResponse>;

type UserDetailPayload = UserProfile | OperationResult<UserProfile>;

function unwrapOperationResult<T>(payload: T | OperationResult<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }

  return payload as T;
}

function compactQuery(query: UserListQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function canUsePeriodAlias(query: UserListQuery) {
  return (
    !query.fromDate &&
    !query.toDate &&
    !query.search &&
    !query.email &&
    !query.username &&
    !query.phone &&
    query.isActive === undefined &&
    query.isLocked === undefined &&
    (query.sortBy === undefined || query.sortBy === "createdDate") &&
    (query.sortDir === undefined || query.sortDir === "desc")
  );
}

function resolveAdminUsersPath(query: UserListQuery) {
  if (!canUsePeriodAlias(query)) return userRoute.adminUsers;
  if (query.period === "7d") return userRoute.recent7Days;
  if (query.period === "30d") return userRoute.recent30Days;
  if (query.period === "all") return userRoute.allUsers;
  return userRoute.adminUsers;
}

export interface AdminUserUpdateRequest {
  email: string;
  username: string;
  identityNumber: string;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
}

export const userRouteFn = {
  getAdminUsers: async (query: UserListQuery) => {
    const path = resolveAdminUsersPath(query);
    const params =
      path === userRoute.adminUsers
        ? compactQuery(query)
        : compactQuery({ page: query.page, pageSize: query.pageSize });

    const response = await api.get<AdminUsersPayload>(path, { params });
    return unwrapOperationResult(response.data);
  },
  getUserByKey: async (gmailOrUserName: string) => {
    const response = await api.get<UserDetailPayload>(
      userRoute.detailByKey(gmailOrUserName)
    );
    return unwrapOperationResult(response.data);
  },
  updateAdminUser: async (id: string | number, data: AdminUserUpdateRequest) => {
    const response = await api.put<UserDetailPayload>(userRoute.adminUserById(id), data);
    return unwrapOperationResult(response.data);
  },
  deleteAdminUser: async (id: string | number) => {
    await api.delete(userRoute.adminUserById(id));
  },
  registerFcmToken: async (token: string) => {
    await api.patch(userRoute.fcmToken, { token }, { suppressErrorToast: true } as object);
  },
};

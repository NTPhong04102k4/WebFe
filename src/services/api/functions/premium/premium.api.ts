import apiClient from "@/services/api/axiosInstance";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { OperationResult } from "src/services/types/common.types";
import type {
  AdminSubscription,
  AdminSubscriptionsQuery,
  AdminSubscriptionsResponse,
  PremiumPlan,
  PremiumPlanCreateRequest,
  PremiumPlanUpdateRequest,
  SubscribeRequest,
  UserPremiumResponse,
} from "./premium.types";

export const premiumApi = {
  getAllPlans: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<PremiumPlan[] | OperationResult<PremiumPlan[]>>(
      API.premium.plans,
      withSignal({}, options)
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d) {
      return (d as OperationResult<PremiumPlan[]>).data ?? [];
    }
    return d as PremiumPlan[];
  },

  getMySubscription: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<UserPremiumResponse | OperationResult<UserPremiumResponse>>(
      API.premium.mySubscription,
      withSignal({}, options)
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d && !("hasActiveSubscription" in d)) {
      return (d as OperationResult<UserPremiumResponse>).data ?? { subscription: null, hasActiveSubscription: false };
    }
    return d as UserPremiumResponse;
  },

  subscribe: async (req: SubscribeRequest) => {
    const res = await apiClient.post<OperationResult>(API.premium.subscribe, req);
    return res.data;
  },

  cancelSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.cancel, {});
    return res.data;
  },

  renewSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.renew, {});
    return res.data;
  },

  // Admin
  adminCreatePlan: async (req: PremiumPlanCreateRequest) => {
    const res = await apiClient.post<OperationResult<PremiumPlan>>(API.premium.plans, req);
    return res.data;
  },

  adminUpdatePlan: async (id: number, req: PremiumPlanUpdateRequest) => {
    const res = await apiClient.put<OperationResult<PremiumPlan>>(API.premium.plan(id), req);
    return res.data;
  },

  adminDeletePlan: async (id: number) => {
    const res = await apiClient.delete<OperationResult>(API.premium.plan(id));
    return res.data;
  },

  adminGetSubscriptions: async (query: AdminSubscriptionsQuery = {}, options?: ApiRequestOptions) => {
    const res = await apiClient.get<AdminSubscriptionsResponse | OperationResult<AdminSubscriptionsResponse>>(
      API.premium.adminSubscriptions,
      withSignal({ params: query }, options)
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d) {
      return (d as OperationResult<AdminSubscriptionsResponse>).data ?? { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
    return d as AdminSubscriptionsResponse;
  },

  adminGetUserSubscription: async (userId: string | number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<UserPremiumResponse | OperationResult<UserPremiumResponse>>(
      API.premium.adminUserSubscription(userId),
      withSignal({}, options)
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d && !("hasActiveSubscription" in d)) {
      return (d as OperationResult<UserPremiumResponse>).data ?? { subscription: null, hasActiveSubscription: false };
    }
    return d as UserPremiumResponse;
  },
};

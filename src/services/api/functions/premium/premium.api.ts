import apiClient from "@/services/api/axiosInstance";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { OperationResult } from "src/services/types/common.types";
import type {
  AdminSubscriptionsQuery,
  AdminSubscriptionsResponse,
  PremiumPlan,
  PremiumPlanCreateRequest,
  PremiumPlanUpdateRequest,
  SubscribeRequest,
  UserPremiumResponse,
} from "./premium.types";

export const premiumApi = {
  /** GET /premium-plans — Public */
  getAllPlans: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<PremiumPlan[] | OperationResult<PremiumPlan[]>>(
      API.premium.plans,
      withSignal({}, options)
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d && Array.isArray((d as OperationResult<PremiumPlan[]>).data)) {
      return (d as OperationResult<PremiumPlan[]>).data ?? [];
    }
    return Array.isArray(d) ? d : [];
  },

  /** GET /premium-plans/my-subscription — Customer only */
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

  /** POST /premium-plans/subscribe — Customer only */
  subscribe: async (req: SubscribeRequest) => {
    const res = await apiClient.post<OperationResult>(API.premium.subscribe, req);
    return res.data;
  },

  /** POST /premium-plans/cancel — Customer only */
  cancelSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.cancel, {});
    return res.data;
  },

  /** POST /premium-plans/renew — Customer only */
  renewSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.renew, {});
    return res.data;
  },

  // ── Admin CRUD ──────────────────────────────────────────────────────────────

  /** POST /premium-plans — Admin, SuperAdmin */
  adminCreatePlan: async (req: PremiumPlanCreateRequest) => {
    const res = await apiClient.post<OperationResult<PremiumPlan>>(API.premium.plans, req);
    return res.data;
  },

  /** PUT /premium-plans/{id} — Admin, SuperAdmin */
  adminUpdatePlan: async (id: number, req: PremiumPlanUpdateRequest) => {
    const res = await apiClient.put<OperationResult<PremiumPlan>>(API.premium.plan(id), req);
    return res.data;
  },

  /** DELETE /premium-plans/{id} — Admin, SuperAdmin */
  adminDeletePlan: async (id: number) => {
    const res = await apiClient.delete<OperationResult>(API.premium.plan(id));
    return res.data;
  },

  /**
   * GET /premium-plans/admin/subscriptions
   * Added in backend commit: feat/manage revenue premium plans
   * Response shape: { Data: [...], TotalCount, Page, PageSize }
   */
  adminGetSubscriptions: async (query: AdminSubscriptionsQuery = {}, options?: ApiRequestOptions) => {
    const res = await apiClient.get<AdminSubscriptionsResponse>(
      API.premium.adminSubscriptions,
      withSignal({ params: query }, options)
    );
    // Backend trả { Data, TotalCount, Page, PageSize } (không wrap OperationResult)
    return res.data;
  },
};

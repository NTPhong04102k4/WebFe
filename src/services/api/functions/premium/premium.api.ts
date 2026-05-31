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
    const res = await apiClient.get(API.premium.plans, withSignal({}, options));
    const d = res.data as unknown;

    let raw: unknown[];
    if (Array.isArray(d)) raw = d;
    else if (d && typeof d === "object") {
      const obj = d as Record<string, unknown>;
      if (Array.isArray(obj.data)) raw = obj.data;
      else if (Array.isArray(obj.items)) raw = obj.items;
      else if (Array.isArray(obj.$values)) raw = obj.$values;
      else raw = [];
    } else {
      raw = [];
    }

    // Backend trả price dạng { source: "99000.00", parsedValue: 99000 } — normalize về number
    const toNum = (v: unknown): number => {
      if (typeof v === "number") return v;
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        if (typeof o.parsedValue === "number") return o.parsedValue;
        const n = Number(o.source);
        return isNaN(n) ? 0 : n;
      }
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    // Suy ra tier từ planCode / planName khi server không trả tier
    const inferTier = (code: string, name: string): string => {
      const s = (code + " " + name).toLowerCase();
      if (s.includes("plat")) return "Platinum";
      if (s.includes("gold")) return "Gold";
      if (s.includes("silver")) return "Silver";
      if (s.includes("enter") || s.includes("enterprise")) return "Platinum";
      return "Bronze";
    };

    return raw.map((item) => {
      const p = item as Record<string, unknown>;
      return {
        ...p,
        monthlyPrice: toNum(p.monthlyPrice),
        yearlyPrice: toNum(p.yearlyPrice),
        discountPercent: toNum(p.discountPercent),
        isActive: typeof p.isActive === "boolean" ? p.isActive : true,
        tier: (p.tier as string | undefined) ?? inferTier(
          (p.planCode as string) ?? "",
          (p.planName as string) ?? ""
        ),
      } as PremiumPlan;
    });
  },

  /** GET /premium-plans/my-subscription — Customer only */
  getMySubscription: async (options?: ApiRequestOptions) => {
    try {
      const res = await apiClient.get<UserPremiumResponse | OperationResult<UserPremiumResponse>>(
        API.premium.mySubscription,
        withSignal({ suppressErrorToast: true } as import("axios").AxiosRequestConfig, options)
      );
      const d = res.data;
      if (d && typeof d === "object" && "data" in d && !("hasActiveSubscription" in d)) {
        return (d as OperationResult<UserPremiumResponse>).data ?? { subscription: null, hasActiveSubscription: false };
      }
      return d as UserPremiumResponse;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return { subscription: null, hasActiveSubscription: false } as UserPremiumResponse;
      }
      throw err;
    }
  },

  /** POST /premium-plans/subscribe — Customer only */
  subscribe: async (req: SubscribeRequest) => {
    const res = await apiClient.post<OperationResult>(API.premium.subscribe, req);
    return res.data;
  },

  /** POST /premium-plans/subscribe/activate — Customer only */
  activateSubscription: async (body: { paymentReference: string }) => {
    const res = await apiClient.post<OperationResult>(API.premium.subscribeActivate, body);
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

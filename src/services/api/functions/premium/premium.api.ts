import apiClient from "@/services/api/axiosInstance";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { OperationResult } from "src/services/types/common.types";
import type {
  ActivateSubscriptionResult,
  AdminSubscriptionsQuery,
  AdminSubscriptionsResponse,
  DeletePlanResult,
  PremiumPlan,
  PremiumPlanCreateRequest,
  PremiumPlanUpdateRequest,
  SubscribeRequest,
  SubscribeResponseData,
  SubscriptionHistoryQuery,
  SubscriptionHistoryResponse,
  UserPremiumDto,
} from "./premium.types";

export const premiumApi = {
  /** GET /premium-plans — Public. Truyền isActive=true/false để lọc phía server */
  getAllPlans: async (query?: { isActive?: boolean }, options?: ApiRequestOptions) => {
    const params = query?.isActive !== undefined ? { isActive: query.isActive } : undefined;
    const res = await apiClient.get(API.premium.plans, withSignal({ params }, options));
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

  /** GET /premium-plans/my-subscription — Customer only
   *  Trả về:
   *  - UserPremiumDto nếu có (ACTIVE ưu tiên, sau đó PENDING)
   *  - null nếu chưa đăng ký
   */
  getMySubscription: async (options?: ApiRequestOptions): Promise<UserPremiumDto | null> => {
    try {
      const res = await apiClient.get<OperationResult<UserPremiumDto>>(
        API.premium.mySubscription,
        withSignal({ suppressErrorToast: true } as import("axios").AxiosRequestConfig, options)
      );
      const d = res.data;
      if (d && typeof d === "object" && "data" in d) {
        return (d as OperationResult<UserPremiumDto>).data ?? null;
      }
      return (d as unknown as UserPremiumDto) ?? null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  /** POST /premium-plans/subscribe — Customer only
   *  Trả về QR SePay + subscription PENDING mới tạo
   */
  subscribe: async (req: SubscribeRequest): Promise<SubscribeResponseData> => {
    const res = await apiClient.post<OperationResult<SubscribeResponseData>>(
      API.premium.subscribe,
      req
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d) {
      return (d as OperationResult<SubscribeResponseData>).data as SubscribeResponseData;
    }
    return d as unknown as SubscribeResponseData;
  },

  /** GET /premium-plans/subscribe/pending-qr — Customer only
   *  Lấy lại QR từ PENDING subscription hiện có, không tạo mới.
   *  Dùng khi user đóng SubscribeModal nhầm.
   */
  getPendingQr: async (): Promise<SubscribeResponseData> => {
    const res = await apiClient.get<OperationResult<SubscribeResponseData>>(
      API.premium.subscribePendingQr
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d) {
      return (d as OperationResult<SubscribeResponseData>).data as SubscribeResponseData;
    }
    return d as unknown as SubscribeResponseData;
  },

  /** POST /premium-plans/subscribe/activate — Customer only */
  activateSubscription: async (
    body: { paymentReference: string }
  ): Promise<OperationResult<ActivateSubscriptionResult>> => {
    const res = await apiClient.post<OperationResult<ActivateSubscriptionResult>>(
      API.premium.subscribeActivate,
      body
    );
    return res.data;
  },

  /** POST /premium-plans/cancel — Customer only */
  cancelSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.cancel, {});
    return res.data;
  },

  /** POST /premium-plans/subscribe/cancel-pending — Customer only
   *  Xóa đơn PENDING đang chờ thanh toán. 404 nếu không có PENDING nào.
   */
  cancelPendingSubscription: async () => {
    const res = await apiClient.post<OperationResult>(API.premium.cancelPending, {});
    return res.data;
  },

  /** POST /premium-plans/renew — Customer only
   *  Logic giống /subscribe — trả về QR SePay + subscription PENDING mới
   */
  renewSubscription: async (): Promise<SubscribeResponseData> => {
    const res = await apiClient.post<OperationResult<SubscribeResponseData>>(
      API.premium.renew,
      {}
    );
    const d = res.data;
    if (d && typeof d === "object" && "data" in d) {
      return (d as OperationResult<SubscribeResponseData>).data as SubscribeResponseData;
    }
    return d as unknown as SubscribeResponseData;
  },

  /** GET /premium-plans/my-subscriptions — Customer only, paginated subscription history */
  getMySubscriptionHistory: async (
    query: SubscriptionHistoryQuery = {},
    options?: ApiRequestOptions
  ): Promise<SubscriptionHistoryResponse> => {
    const res = await apiClient.get<SubscriptionHistoryResponse>(
      API.premium.mySubscriptions,
      withSignal({ params: query }, options)
    );
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

  /** DELETE /premium-plans/{id} — Admin, SuperAdmin
   *  data.isDeprecated=false → xóa sạch
   *  data.isDeprecated=true  → còn user dùng, gói chuyển sang deprecated
   */
  adminDeletePlan: async (id: number) => {
    const res = await apiClient.delete<OperationResult<DeletePlanResult>>(API.premium.plan(id));
    return res.data;
  },

  /**
   * GET /premium-plans/admin/subscriptions
   * Response shape: { Data: [...], TotalCount, Page, PageSize }
   */
  adminGetSubscriptions: async (query: AdminSubscriptionsQuery = {}, options?: ApiRequestOptions) => {
    const res = await apiClient.get<AdminSubscriptionsResponse>(
      API.premium.adminSubscriptions,
      withSignal({ params: query }, options)
    );
    return res.data;
  },
};

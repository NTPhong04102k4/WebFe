export type SubscriptionType = "Monthly" | "Yearly";

export interface PremiumPlan {
  planID: number;
  planCode: string;
  planName: string;
  tier?: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  /** Backend trả về JSON string — dùng parsePlanFeatures() để convert sang string[] */
  features: string;
  isActive: boolean;
  /** null = bình thường; có giá trị = admin đã lên lịch xóa gói (còn user đang dùng) */
  deprecatedAt?: string | null;
  discountPercent?: number;
  maxCarsView?: number | null;
  maxOrdersPerMonth?: number | null;
  prioritySupport: boolean;
  displayOrder?: number;
  // Legacy fields
  maxListings?: number | null;
  aiChatAccess?: boolean;
}

/** Parse features JSON string thành mảng. An toàn với mọi input. */
export function parsePlanFeatures(features: string | string[] | null | undefined): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(features).split(',').map(s => s.trim()).filter(Boolean);
  }
}

/** Flat subscription DTO — C# UserPremiumResponse */
export interface UserPremiumDto {
  userPremiumID: number;
  userID: string;
  planID: number;
  planName: string;
  planCode: string;
  subscriptionType: SubscriptionType;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  /** false = PENDING (chờ thanh toán), true = ACTIVE */
  isActive: boolean;
  /** null = đang hoạt động; có giá trị = đã hủy nhưng còn hiệu lực đến endDate */
  deprecatedAt?: string | null;
  paymentMethod?: string | null;
  /** null khi isActive=true; lộ ra khi isActive=false (PENDING) */
  paymentReference?: string | null;
  /** Backend set = CreatedDate + 24h cho mọi PENDING subscription mới */
  paymentExpiredAt?: string | null;
  price: number;
  daysRemaining: number;
}

/** Shape của data trong response từ POST /premium-plans/subscribe/activate */
export interface ActivateSubscriptionResult {
  subscription: UserPremiumDto;
  hasPendingOrders: boolean;
}

/** Thông tin QR SePay trả về sau POST /subscribe hoặc POST /renew */
export interface SubscribePaymentInfo {
  qrImageUrl: string;
  transferContent: string;
  bankAccount: string;
  bankName: string;
  amount: number;
  orderNumber: string;
  expiredAt: string;
  signature: string;
}

/** data field trong response của POST /subscribe và POST /renew */
export interface SubscribeResponseData {
  subscription: UserPremiumDto;
  payment: SubscribePaymentInfo;
}

/** POST /subscribe — server tự sinh paymentMethod và paymentReference */
export interface SubscribeRequest {
  planID: number;
  subscriptionType: SubscriptionType;
  autoRenew: boolean;
}

export interface PremiumPlanCreateRequest {
  planCode: string;
  planName: string;
  description?: string | null;
  /** Backend nhận JSON string — dùng JSON.stringify(featuresArray) */
  features: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discountPercent?: number;
  maxCarsView?: number | null;
  maxOrdersPerMonth?: number | null;
  prioritySupport: boolean;
  isActive: boolean;
  displayOrder?: number;
}

export type PremiumPlanUpdateRequest = PremiumPlanCreateRequest;

/**
 * AdminSubscriptionResponse — maps to C# AdminSubscriptionResponse
 * Commit: feat/manage revenue premium plans
 */
export interface AdminSubscription {
  userPremiumID: number;
  userID: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  planID: number;
  planName: string;
  planCode: string;
  subscriptionType: SubscriptionType;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  isActive: boolean;
  /** Phân loại rõ ràng: isActive=false gộp cả Pending lẫn Expired — dùng field này để phân biệt */
  status: "Active" | "Pending" | "Expired";
  paymentMethod?: string | null;
  paymentReference?: string | null;
  price: number;
  daysRemaining: number;
  createdDate: string;
}

/** Response shape từ controller: { Data, TotalCount, Page, PageSize } */
export interface AdminSubscriptionsResponse {
  data: AdminSubscription[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** GET /premium-plans/my-subscriptions — customer subscription history item */
export interface SubscriptionHistoryItem {
  userPremiumID: number;
  planID: number;
  planName: string;
  planCode: string;
  subscriptionType: SubscriptionType;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  isActive: boolean;
  /** Active | Pending | Expired */
  status: "Active" | "Pending" | "Expired";
  paymentMethod?: string | null;
  price: number;
  createdDate: string;
}

/** Response shape từ GET /premium-plans/my-subscriptions */
export interface SubscriptionHistoryResponse {
  data: SubscriptionHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Query params cho GET /premium-plans/my-subscriptions */
export interface SubscriptionHistoryQuery {
  page?: number;
  pageSize?: number;
}

/** Query params cho GET /premium-plans/admin/subscriptions */
export interface AdminSubscriptionsQuery {
  page?: number;
  pageSize?: number;
  planId?: number;
  isActive?: boolean;
  subscriptionType?: string;
}

/** Kết quả xóa gói (Admin) — server trả 2 trường hợp */
export interface DeletePlanResult {
  /** false = xóa sạch; true = còn user đang dùng, gói chuyển sang deprecated */
  isDeprecated: boolean;
  activeSubscriberCount: number;
  /** Ngày hết hạn xa nhất khi isDeprecated=true */
  lastExpiryDate?: string | null;
  message: string;
}

const PREMIUM_ERROR_MESSAGES: Record<string, string> = {
  NotFound: "Chưa tìm thấy giao dịch. Vui lòng chờ thêm hoặc thử lại.",
  RenewFailed: "Bạn chưa có gói để gia hạn.",
  TooEarlyToRenew: "Gói còn hơn 7 ngày — chỉ có thể gia hạn khi còn ≤ 7 ngày.",
  SubscriptionFailed: "Gói này hiện không còn khả dụng.",
  PlanCodeExists: "Mã gói đã tồn tại.",
  ValidationError: "Dữ liệu không hợp lệ.",
  Unauthorized: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
  InternalError: "Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại.",
  PaymentExpired: "Phiên thanh toán đã hết hạn (24h). Vui lòng tạo lại đăng ký.",
  OrderLimitExceeded: "Bạn đã đạt giới hạn đơn hàng tháng này theo gói premium.",
  AmountMismatch: "Số tiền chuyển khoản không khớp. Vui lòng liên hệ admin.",
  PaymentVerificationFailed: "Không thể xác minh thanh toán lúc này. Vui lòng thử lại sau ít phút.",
};

/** Trích errorCode từ OperationResult lỗi, map sang thông báo tiếng Việt thân thiện */
export function getPremiumErrorMessage(error: unknown): string {
  const data = (error as { response?: { data?: { errorCode?: string; message?: string } } })
    ?.response?.data;
  const code = data?.errorCode;
  return PREMIUM_ERROR_MESSAGES[code ?? ""] ?? data?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
}

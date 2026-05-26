export type SubscriptionType = "Monthly" | "Yearly";
export type SubscriptionStatus = "Active" | "Expired" | "Cancelled" | "Pending";
export type PaymentMethod = "BankTransfer" | "CreditCard" | "MoMo" | "ZaloPay" | "Cash";

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
  discountPercent?: number;
  maxCarsView?: number | null;
  maxOrdersPerMonth?: number | null;
  prioritySupport: boolean;
  displayOrder?: number;
  // Legacy fields — có thể không có trong response mới
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
    // fallback: comma-separated
    return String(features).split(',').map(s => s.trim()).filter(Boolean);
  }
}

export interface PremiumPlanResponse {
  plans: PremiumPlan[];
}

export interface UserPremium {
  subscriptionID: number;
  planID: number;
  planName: string;
  tier: string;
  subscriptionType: SubscriptionType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  autoRenew: boolean;
  paymentMethod?: string | null;
  features: string[];
}

export interface UserPremiumResponse {
  subscription: UserPremium | null;
  hasActiveSubscription: boolean;
}

export interface SubscribeRequest {
  planID: number;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
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
  userID: string;           // Guid as string
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
  isActive: boolean;        // bool, không phải status string
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

/** Query params cho GET /premium-plans/admin/subscriptions */
export interface AdminSubscriptionsQuery {
  page?: number;
  pageSize?: number;
  planId?: number;          // backend param là planId (camelCase)
  isActive?: boolean;       // bool
  subscriptionType?: string; // "Monthly" | "Yearly"
}


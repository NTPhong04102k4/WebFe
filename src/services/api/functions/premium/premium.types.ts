export type SubscriptionType = "Monthly" | "Yearly";
export type SubscriptionStatus = "Active" | "Expired" | "Cancelled" | "Pending";
export type PaymentMethod = "BankTransfer" | "CreditCard" | "MoMo" | "ZaloPay" | "Cash";

export interface PremiumPlan {
  planID: number;
  planName: string;
  tier: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
  maxListings?: number | null;
  prioritySupport: boolean;
  aiChatAccess: boolean;
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

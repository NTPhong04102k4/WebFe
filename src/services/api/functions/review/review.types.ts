export type { PagedResult } from "../hr/hr.types";

// ─── Car Review ──────────────────────────────────────────────────────────────

export interface CarReviewRequest {
  carID: number;
  orderID?: number | null;
  overallRating: number;
  performanceRating?: number | null;
  comfortRating?: number | null;
  designRating?: number | null;
  valueRating?: number | null;
  title?: string | null;
  content: string;
  pros?: string | null;
  cons?: string | null;
  imagePaths?: string[] | null;
}

export interface CarReviewViewModel {
  reviewID: number;
  carID: number;
  carName?: string | null;
  userID: number;
  reviewerName?: string | null;
  overallRating: number;
  performanceRating?: number | null;
  comfortRating?: number | null;
  designRating?: number | null;
  valueRating?: number | null;
  title?: string | null;
  content: string;
  pros?: string | null;
  cons?: string | null;
  status: string;
  helpfulCount: number;
  isVerifiedPurchase?: boolean;
  createdDate: string;
}

export interface CarReviewStats {
  carID: number;
  averageRating: number;
  reviewCount: number;
  count5Star: number;
  count4Star: number;
  count3Star: number;
  count2Star: number;
  count1Star: number;
  avgPerformance?: number | null;
  avgComfort?: number | null;
  avgDesign?: number | null;
  avgValue?: number | null;
}

// ─── Service Review ──────────────────────────────────────────────────────────

export interface ServiceReviewRequest {
  workOrderID: number;
  technicianID?: number | null;
  locationID?: number | null;
  overallRating: number;
  qualityRating?: number | null;
  speedRating?: number | null;
  priceRating?: number | null;
  attitudeRating?: number | null;
  title?: string | null;
  content: string;
  imagePaths?: string[] | null;
  wouldRecommend?: boolean | null;
}

export interface ServiceReviewViewModel {
  reviewID: number;
  workOrderID: number;
  userID: number;
  reviewerName?: string | null;
  technicianID?: number | null;
  technicianName?: string | null;
  locationID?: number | null;
  overallRating: number;
  qualityRating?: number | null;
  speedRating?: number | null;
  priceRating?: number | null;
  attitudeRating?: number | null;
  title?: string | null;
  content: string;
  status: string;
  responseFromShop?: string | null;
  wouldRecommend?: boolean | null;
  createdDate: string;
}

export interface ServiceReviewStats {
  subjectID: number;
  subjectType: "Technician" | "Location";
  averageRating: number;
  reviewCount: number;
  count5Star: number;
  count4Star: number;
  count3Star: number;
  count2Star: number;
  count1Star: number;
  avgQuality?: number | null;
  avgSpeed?: number | null;
  avgPrice?: number | null;
  avgAttitude?: number | null;
  wouldRecommendCount: number;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  carId?: number;
  technicianId?: number;
  locationId?: number;
  fromDate?: string;
  toDate?: string;
  _scope?: string;
}

export interface ReviewModerateRequest {
  status?: "Approved" | "Rejected";
  rejectReason?: string | null;
  action?: "Approve" | "Reject";
  reason?: string | null;
}

export interface ReviewHelpfulRequest {
  reviewType: "Car" | "Service";
  isHelpful: boolean;
}

export interface ReviewReportRequest {
  reviewType: "Car" | "Service";
  reason: string;
  description?: string | null;
}

export interface ServiceReviewRespondRequest {
  responseFromShop: string;
}

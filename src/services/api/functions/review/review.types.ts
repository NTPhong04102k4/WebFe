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
}

// ─── Service Review ──────────────────────────────────────────────────────────

export interface ServiceReviewRequest {
  workOrderID: number;
  technicianID?: number | null;
  overallRating: number;
  qualityRating?: number | null;
  timelinessRating?: number | null;
  title?: string | null;
  content: string;
}

export interface ServiceReviewViewModel {
  reviewID: number;
  workOrderID: number;
  userID: number;
  reviewerName?: string | null;
  technicianID?: number | null;
  technicianName?: string | null;
  overallRating: number;
  qualityRating?: number | null;
  timelinessRating?: number | null;
  title?: string | null;
  content: string;
  status: string;
  shopResponse?: string | null;
  createdDate: string;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  carId?: number;
  technicianId?: number;
  locationId?: number;
}

export interface ReviewModerateRequest {
  status?: "Approved" | "Rejected";
  rejectReason?: string | null;
  action?: "Approve" | "Reject";
  reason?: string | null;
}

export interface ReviewHelpfulRequest {
  isHelpful: boolean;
}

export interface ReviewReportRequest {
  reason: string;
  description?: string | null;
}

export interface ServiceReviewRespondRequest {
  response: string;
}

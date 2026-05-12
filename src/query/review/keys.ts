import type { ReviewListParams } from "src/services/api/functions/review/review.types";

export const reviewKeys = {
  all: ["review"] as const,
  carReviews: (params: ReviewListParams) =>
    [...reviewKeys.all, "cars", params] as const,
  carReview: (id: number) => [...reviewKeys.all, "car", id] as const,
  serviceReviews: (params: ReviewListParams) =>
    [...reviewKeys.all, "services", params] as const,
  serviceReview: (id: number) => [...reviewKeys.all, "service", id] as const,
  pending: (params: ReviewListParams) =>
    [...reviewKeys.all, "pending", params] as const,
};

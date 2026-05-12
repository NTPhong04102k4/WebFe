import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { reviewApi } from "src/services/api/functions/review/review.api";
import type { ReviewListParams, ReviewModerateRequest } from "src/services/api/functions/review/review.types";

import { reviewKeys } from "./keys";

// ─── Car reviews ─────────────────────────────────────────────────────────────

export function useCarReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.carReviews(params),
    queryFn: ({ signal }) => reviewApi.listCarReviews(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useCarReview(id: number | null) {
  return useQuery({
    queryKey: id != null ? reviewKeys.carReview(id) : ["review", "car", "none"],
    queryFn: ({ signal }) => reviewApi.getCarReview(id!, { signal }),
    enabled: id != null,
  });
}

// ─── Service reviews ──────────────────────────────────────────────────────────

export function useServiceReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.serviceReviews(params),
    queryFn: ({ signal }) => reviewApi.listServiceReviews(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useServiceReview(id: number | null) {
  return useQuery({
    queryKey: id != null ? reviewKeys.serviceReview(id) : ["review", "service", "none"],
    queryFn: ({ signal }) => reviewApi.getServiceReview(id!, { signal }),
    enabled: id != null,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function usePendingReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.pending(params),
    queryFn: ({ signal }) => reviewApi.listPendingReviews(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useReviewMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: reviewKeys.all });

  return {
    deleteCarReview: useMutation({
      mutationFn: (id: number) => reviewApi.deleteCarReview(id),
      onSuccess: invalidate,
    }),
    deleteServiceReview: useMutation({
      mutationFn: (id: number) => reviewApi.deleteServiceReview(id),
      onSuccess: invalidate,
    }),
    moderateReview: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ReviewModerateRequest }) =>
        reviewApi.moderateReview(id, body),
      onSuccess: invalidate,
    }),
  };
}

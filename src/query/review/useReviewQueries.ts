import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { reviewApi } from "src/services/api/functions/review/review.api";
import type {
  CarReviewRequest,
  ReviewHelpfulRequest,
  ReviewListParams,
  ReviewModerateRequest,
  ReviewReportRequest,
  ServiceReviewRequest,
} from "src/services/api/functions/review/review.types";
import { useAuthStore } from "src/stores/authStore";

import { reviewKeys } from "./keys";

// ─── Car reviews ─────────────────────────────────────────────────────────────

export function useCarReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.carReviews(params),
    queryFn: ({ signal }) => reviewApi.listCarReviews(params, { signal }),
    enabled: Boolean(params.carId),
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

export function useMyCarReviews(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...reviewKeys.all, "my-car", { page, pageSize }],
    queryFn: ({ signal }) => reviewApi.listMyCarReviews({ page, pageSize }, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useMyServiceReviews(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...reviewKeys.all, "my-service", { page, pageSize }],
    queryFn: ({ signal }) => reviewApi.listMyServiceReviews({ page, pageSize }, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

/** Lấy review của user hiện tại cho một xe. Dùng GET /reviews/cars/my rồi filter theo carID. */
export function useMyCarReview(carId: number | null) {
  const userId = useAuthStore((s) => s.user?.userID);
  return useQuery({
    queryKey: carId != null && userId != null ? [...reviewKeys.all, "my-car-check", carId] : ["review", "mine", "none"],
    queryFn: async ({ signal }) => {
      const result = await reviewApi.listMyCarReviews({ page: 1, pageSize: 100 }, { signal });
      return result.data.find((r) => r.carID === carId) ?? null;
    },
    enabled: carId != null && userId != null,
  });
}

export function useCarReviewStats(carId: number | null) {
  return useQuery({
    queryKey: carId != null ? [...reviewKeys.carReviews({ carId }), "stats"] : ["review", "car", "stats", "none"],
    queryFn: ({ signal }) => reviewApi.getCarReviewStats(carId!, { signal }),
    enabled: carId != null,
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

export function useServiceReviewByWorkOrder(workOrderId: number | null) {
  return useQuery({
    queryKey: workOrderId != null ? [...reviewKeys.all, "work-order", workOrderId] : ["review", "work-order", "none"],
    queryFn: ({ signal }) => reviewApi.getServiceReviewByWorkOrder(workOrderId!, { signal }),
    enabled: workOrderId != null,
    retry: false,
  });
}

export function useServiceTechnicianStats(technicianId: number | null) {
  return useQuery({
    queryKey: technicianId != null ? [...reviewKeys.all, "technician-stats", technicianId] : ["review", "technician-stats", "none"],
    queryFn: ({ signal }) => reviewApi.getServiceTechnicianStats(technicianId!, { signal }),
    enabled: technicianId != null,
    staleTime: 5 * 60_000,
  });
}

export function useServiceLocationStats(locationId: number | null) {
  return useQuery({
    queryKey: locationId != null ? [...reviewKeys.all, "location-stats", locationId] : ["review", "location-stats", "none"],
    queryFn: ({ signal }) => reviewApi.getServiceLocationStats(locationId!, { signal }),
    enabled: locationId != null,
    staleTime: 5 * 60_000,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAllCarReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.pending({ ...params, _scope: "all" }),
    queryFn: ({ signal }) => reviewApi.listAllCarReviews(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

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
    createCarReview: useMutation({
      mutationFn: (body: CarReviewRequest) => reviewApi.createCarReview(body),
      onSuccess: invalidate,
    }),
    updateCarReview: useMutation({
      mutationFn: ({ id, body }: { id: number; body: CarReviewRequest }) =>
        reviewApi.updateCarReview(id, body),
      onSuccess: invalidate,
    }),
    createServiceReview: useMutation({
      mutationFn: (body: ServiceReviewRequest) => reviewApi.createServiceReview(body),
      onSuccess: invalidate,
    }),
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
    respondToServiceReview: useMutation({
      mutationFn: ({ id, responseFromShop }: { id: number; responseFromShop: string }) =>
        reviewApi.respondToServiceReview(id, { responseFromShop }),
      onSuccess: invalidate,
    }),
    voteHelpful: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ReviewHelpfulRequest }) =>
        reviewApi.voteHelpful(id, body),
    }),
    reportReview: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ReviewReportRequest }) =>
        reviewApi.reportReview(id, body),
    }),
  };
}

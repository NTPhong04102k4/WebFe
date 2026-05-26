import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  CarReviewViewModel,
  PagedResult,
  CarReviewRequest,
  CarReviewStats,
  ReviewListParams,
  ReviewModerateRequest,
  ServiceReviewRequest,
  ServiceReviewViewModel,
} from "./review.types";

function compactParams(params: ReviewListParams) {
  const { carId, technicianId, locationId, ...rest } = params;
  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export const reviewApi = {
  // ─── Car reviews ───────────────────────────────────────────────────────────

  listCarReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    if (!params.carId) throw new Error("carId is required");
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.carList(params.carId),
      withSignal({ params: compactParams(params) }, options)
    );
    return res.data;
  },

  getCarReviewStats: async (carId: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CarReviewStats>(
      API.review.carStats(carId),
      withSignal({}, options)
    );
    return res.data;
  },

  getCarReview: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CarReviewViewModel>(
      API.review.carDetail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createCarReview: async (body: CarReviewRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<CarReviewViewModel>(
      API.review.carCreate,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  deleteCarReview: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.review.car(id), withSignal({}, options));
  },

  // ─── Service reviews ────────────────────────────────────────────────────────

  listServiceReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    const path = params.technicianId
      ? API.review.serviceByTechnician(params.technicianId)
      : params.locationId
        ? API.review.serviceByLocation(params.locationId)
        : API.review.serviceByLocation(0);
    const res = await apiClient.get<PagedResult<ServiceReviewViewModel>>(
      path,
      withSignal({ params: compactParams(params) }, options)
    );
    return res.data;
  },

  getServiceReview: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<ServiceReviewViewModel>(
      API.review.service(id),
      withSignal({}, options)
    );
    return res.data;
  },

  deleteServiceReview: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.review.service(id), withSignal({}, options));
  },

  createServiceReview: async (body: ServiceReviewRequest, options?: ApiRequestOptions) => {
    const res = await apiClient.post<ServiceReviewViewModel>(
      API.review.serviceCreate,
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  respondToServiceReview: async (
    id: number,
    body: { response: string },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.post<ServiceReviewViewModel>(
      API.review.serviceRespond(id),
      body,
      withSignal({}, options)
    );
    return res.data;
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  listPendingReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.adminPending,
      withSignal({ params: compactParams(params) }, options)
    );
    return res.data;
  },

  moderateReview: async (
    id: number,
    body: ReviewModerateRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.put<CarReviewViewModel>(
      API.review.adminModerate(id),
      {
        status: body.status ?? (body.action === "Approve" ? "Approved" : "Rejected"),
        rejectReason: body.rejectReason ?? body.reason ?? null,
      },
      withSignal({}, options)
    );
    return res.data;
  },
};

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
  ReviewHelpfulRequest,
  ReviewReportRequest,
  ServiceReviewRequest,
  ServiceReviewViewModel,
  ServiceReviewStats,
  ServiceReviewRespondRequest,
} from "./review.types";

function compactParams(params: ReviewListParams) {
  const { carId, technicianId, locationId, ...rest } = params;
  return Object.fromEntries(
    Object.entries(rest).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export const reviewApi = {
  // ─── Car reviews ───────────────────────────────────────────────────────────

  listCarReviews: async (
    params: ReviewListParams,
    options?: ApiRequestOptions,
  ) => {
    if (!params.carId) throw new Error("carId is required");
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.carList(params.carId),
      withSignal({ params: compactParams(params) }, options),
    );
    return res.data;
  },

  listMyCarReviews: async (
    params: { page?: number; pageSize?: number },
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.carMy,
      withSignal({ params }, options),
    );
    return res.data;
  },

  listMyServiceReviews: async (
    params: { page?: number; pageSize?: number },
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<PagedResult<ServiceReviewViewModel>>(
      API.review.serviceMy,
      withSignal({ params }, options),
    );
    return res.data;
  },

  getCarReviewStats: async (carId: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CarReviewStats>(
      API.review.carStats(carId),
      withSignal({}, options),
    );
    return res.data;
  },

  getCarReview: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CarReviewViewModel>(
      API.review.carDetail(id),
      withSignal({}, options),
    );
    return res.data;
  },

  createCarReview: async (
    body: CarReviewRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.post<CarReviewViewModel>(
      API.review.carCreate,
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  updateCarReview: async (
    id: number,
    body: CarReviewRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.put<CarReviewViewModel>(
      API.review.carUpdate(id),
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  deleteCarReview: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.review.car(id), withSignal({}, options));
  },

  // ─── Service reviews ────────────────────────────────────────────────────────

  listServiceReviews: async (
    params: ReviewListParams,
    options?: ApiRequestOptions,
  ) => {
    const path = params.technicianId
      ? API.review.serviceByTechnician(params.technicianId)
      : params.locationId
        ? API.review.serviceByLocation(params.locationId)
        : API.review.serviceByLocation(0);
    const res = await apiClient.get<PagedResult<ServiceReviewViewModel>>(
      path,
      withSignal({ params: compactParams(params) }, options),
    );
    return res.data;
  },

  getServiceReview: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<ServiceReviewViewModel>(
      API.review.service(id),
      withSignal({}, options),
    );
    return res.data;
  },

  deleteServiceReview: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.review.service(id), withSignal({}, options));
  },

  createServiceReview: async (
    body: ServiceReviewRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.post<ServiceReviewViewModel>(
      API.review.serviceCreate,
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  getServiceReviewByWorkOrder: async (
    workOrderId: number,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<ServiceReviewViewModel>(
      API.review.serviceWorkOrder(workOrderId),
      withSignal({}, options),
    );
    return res.data;
  },

  getServiceTechnicianStats: async (
    technicianId: number,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<ServiceReviewStats>(
      API.review.serviceTechnicianStats(technicianId),
      withSignal({}, options),
    );
    return res.data;
  },

  getServiceLocationStats: async (
    locationId: number,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<ServiceReviewStats>(
      API.review.serviceLocationStats(locationId),
      withSignal({}, options),
    );
    return res.data;
  },

  voteHelpful: async (
    reviewId: number,
    body: ReviewHelpfulRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.post<unknown>(
      API.review.carHelpful(reviewId),
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  reportReview: async (
    reviewId: number,
    body: ReviewReportRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.post<unknown>(
      API.review.carReport(reviewId),
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  respondToServiceReview: async (
    id: number,
    body: ServiceReviewRespondRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.post<ServiceReviewViewModel>(
      API.review.serviceRespond(id),
      body,
      withSignal({}, options),
    );
    return res.data;
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  listAllCarReviews: async (
    params: ReviewListParams,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.adminAll,
      withSignal({ params: compactParams(params) }, options),
    );
    return res.data;
  },

  listPendingReviews: async (
    params: ReviewListParams,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.adminPending,
      withSignal({ params: compactParams(params) }, options),
    );
    return res.data;
  },

  moderateReview: async (
    id: number,
    body: ReviewModerateRequest,
    options?: ApiRequestOptions,
  ) => {
    const res = await apiClient.put<CarReviewViewModel>(
      API.review.adminModerate(id),
      {
        status:
          body.status ?? (body.action === "Approve" ? "Approved" : "Rejected"),
        rejectReason: body.rejectReason ?? body.reason ?? null,
      },
      withSignal({}, options),
    );
    return res.data;
  },
};

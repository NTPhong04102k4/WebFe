import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  CarReviewViewModel,
  PagedResult,
  ReviewListParams,
  ReviewModerateRequest,
  ServiceReviewViewModel,
} from "./review.types";

export const reviewApi = {
  // ─── Car reviews ───────────────────────────────────────────────────────────

  listCarReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.carList,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getCarReview: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CarReviewViewModel>(
      API.review.car(id),
      withSignal({}, options)
    );
    return res.data;
  },

  deleteCarReview: async (id: number, options?: ApiRequestOptions) => {
    await apiClient.delete(API.review.car(id), withSignal({}, options));
  },

  // ─── Service reviews ────────────────────────────────────────────────────────

  listServiceReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PagedResult<ServiceReviewViewModel>>(
      API.review.serviceList,
      withSignal({ params }, options)
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

  // ─── Admin ─────────────────────────────────────────────────────────────────

  listPendingReviews: async (params: ReviewListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PagedResult<CarReviewViewModel>>(
      API.review.adminPending,
      withSignal({ params }, options)
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
      body,
      withSignal({}, options)
    );
    return res.data;
  },
};

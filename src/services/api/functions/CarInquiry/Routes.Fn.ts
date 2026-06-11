import apiClient from "../..";
import type { OperationResult, PagedResponse } from "src/services/types/common.types";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import { carInquiryRoute } from "./Routes";
import type { CarInquiryListParams, CarInquiryStatusRequest } from "src/shared/types/Request/CarInquiry";
import type { CarInquiryViewModel } from "src/shared/types/Reponse/CarInquiry";

export const carInquiryRouteFn = {
  getPaging: async (params: CarInquiryListParams, options?: ApiRequestOptions) => {
    const response = await apiClient.get<PagedResponse<CarInquiryViewModel>>(
      carInquiryRoute.list,
      withSignal({ params }, options)
    );
    return response.data;
  },
  updateStatus: async (id: number, body: CarInquiryStatusRequest, options?: ApiRequestOptions) => {
    const response = await apiClient.patch<OperationResult>(
      carInquiryRoute.updateStatus(id),
      body,
      withSignal({}, options)
    );
    return response.data;
  },
};

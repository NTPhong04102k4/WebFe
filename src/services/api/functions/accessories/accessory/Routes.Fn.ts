import apiClient from "src/services/api";
import { accessoryRoute } from "./Routes";
import {
  AccessoryPagingRequest,
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import {
  AccessoryDetailResponse,
  AccessoryListResponse,
} from "src/shared/types/Reponse/accessories/accessory";
import type { OperationResult } from "src/services/types/common.types";
import type { ApiRequestOptions } from "../../../requestOptions";
import { withSignal } from "../../../requestOptions";

function unwrapData<T>(payload: OperationResult<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as OperationResult<T>).data as T;
  }

  return payload as T;
}

function toFormData(
  data: AccessoryRequestCreate | AccessoryRequestUpdate
): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  });
  return form;
}

export const accessoryRouteFn = {
  getDetail: async (id: number, options?: ApiRequestOptions) => {
    const response = await apiClient.get<OperationResult<AccessoryDetailResponse> | AccessoryDetailResponse>(
      accessoryRoute.detail(id),
      withSignal({}, options)
    );
    return unwrapData<AccessoryDetailResponse>(response.data);
  },

  getAll: async () => {
    const response = await apiClient.get<AccessoryListResponse>(
      accessoryRoute.list,
      {
        params: { page: 1, pageSize: 1000 },
      }
    );
    return response.data;
  },

  getPaged: async (params: AccessoryPagingRequest) => {
    const response = await apiClient.get<AccessoryListResponse>(
      accessoryRoute.list,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          priceFrom: params.priceFrom ?? undefined,
          priceTo: params.priceTo ?? undefined,
          categoryID: params.categoryID ?? undefined,
          brandAccessoryID: params.brandAccessoryID ?? undefined,
          sortBy: params.sortBy ?? undefined,
          sortDescending: params.sortDescending ?? false,
        },
      }
    );
    return response.data;
  },

  create: async (data: AccessoryRequestCreate) => {
    const form = toFormData(data);
    const response = await apiClient.post<AccessoryDetailResponse>(
      accessoryRoute.create,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  update: async (id: number, data: AccessoryRequestUpdate) => {
    const form = toFormData(data);
    const response = await apiClient.put<AccessoryDetailResponse>(
      accessoryRoute.update(id),
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(accessoryRoute.delete(id));
    return response.data;
  },
};

import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type {
  ServiceCatalogListResult,
  ServiceCatalogOperationResult,
  ServiceCatalogQuery,
  ServiceCatalogRequest,
  ServiceCatalogStatusRequest,
  ServiceCatalogViewModel,
} from "./serviceCatalog.types";

function compactParams(params: ServiceCatalogQuery) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export const serviceCatalogApi = {
  list: async (params: ServiceCatalogQuery, options?: ApiRequestOptions) => {
    const res = await apiClient.get<ServiceCatalogListResult>(
      API.serviceCatalog.list,
      withSignal({ params: compactParams(params) }, options)
    );
    return res.data;
  },

  detail: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<ServiceCatalogViewModel>(
      API.serviceCatalog.detail(id),
      withSignal({}, options)
    );
    return res.data;
  },

  create: async (body: ServiceCatalogRequest) => {
    const res = await apiClient.post<ServiceCatalogOperationResult<number>>(
      API.serviceCatalog.list,
      body
    );
    return res.data;
  },

  update: async (id: number, body: ServiceCatalogRequest) => {
    const res = await apiClient.put<ServiceCatalogOperationResult>(
      API.serviceCatalog.detail(id),
      body
    );
    return res.data;
  },

  patchStatus: async (id: number, body: ServiceCatalogStatusRequest) => {
    const res = await apiClient.patch<ServiceCatalogOperationResult>(
      API.serviceCatalog.status(id),
      body
    );
    return res.data;
  },

  delete: async (id: number) => {
    const res = await apiClient.delete<ServiceCatalogOperationResult>(
      API.serviceCatalog.detail(id)
    );
    return res.data;
  },
};

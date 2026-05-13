import { CategoryRequestCreate } from "src/shared/types/Request/Category";
import apiClient from "../..";
import { serviceRoute } from "./Routes";
import { CategoryResponse } from "src/shared/types/Reponse/category";
import type { OperationResult } from "src/services/types/common.types";

function unwrapCategories(payload: CategoryResponse[] | OperationResult<CategoryResponse[]>) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapCategory(payload: CategoryResponse | OperationResult<CategoryResponse>) {
  return "data" in payload && payload.data ? payload.data : (payload as CategoryResponse);
}

export const serviceRouteFn = {
  getDetail: async (categoryId: number) => {
    const response = await apiClient.get<CategoryResponse | OperationResult<CategoryResponse>>(
      serviceRoute.detail(categoryId)
    );
    return unwrapCategory(response.data);
  },

  getAll: async () => {
    const response = await apiClient.get<CategoryResponse[] | OperationResult<CategoryResponse[]>>(serviceRoute.list);
    return unwrapCategories(response.data);
  },

  create: async (data: CategoryRequestCreate) => {
    const response = await apiClient.post<CategoryResponse | OperationResult<CategoryResponse>>(
      serviceRoute.create,
      data
    );
    return unwrapCategory(response.data);
  },

  update: async (id: number, data: CategoryRequestCreate) => {
    const response = await apiClient.put<CategoryResponse | OperationResult<CategoryResponse>>(
      serviceRoute.update(id),
      data
    );
    return unwrapCategory(response.data);
  },
};

import { CategoryResponse } from "src/shared/types/Reponse/category";
import type { CategoryRequestCreate } from "src/shared/types/Request/Category";
import type { OperationResult } from "src/services/types/common.types";
import apiClient from "../..";
import { categoryRoute } from "./Routes";

function unwrapCategoryList(payload: CategoryResponse[] | OperationResult<CategoryResponse[]>) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapCategory(payload: CategoryResponse | OperationResult<CategoryResponse>) {
  return "data" in payload && payload.data ? payload.data : (payload as CategoryResponse);
}

export const categoryRouteFn = {
  getCategories: async () => {
    const response = await apiClient.get<CategoryResponse[] | OperationResult<CategoryResponse[]>>(
      categoryRoute.list
    );
    return unwrapCategoryList(response.data);
  },
  getCategory: async (id: number) => {
    const response = await apiClient.get<CategoryResponse | OperationResult<CategoryResponse>>(
      categoryRoute.detail(id)
    );
    return unwrapCategory(response.data);
  },
  createCategory: async (data: CategoryRequestCreate) => {
    const response = await apiClient.post<CategoryResponse | OperationResult<CategoryResponse>>(
      categoryRoute.create,
      data
    );
    return unwrapCategory(response.data);
  },
  updateCategory: async (id: number, data: CategoryRequestCreate) => {
    const response = await apiClient.put<CategoryResponse | OperationResult<CategoryResponse>>(
      categoryRoute.update(id),
      data
    );
    return unwrapCategory(response.data);
  },
};

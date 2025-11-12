import { CategoryRequestCreate } from "src/shared/types/Request/Category";
import apiClient from "../..";
import { serviceRoute } from "./Routes";
import { CategoryResponse } from "src/shared/types/Reponse/category";

export const serviceRouteFn = {
  getDetail: async (categoryId: number) => {
    const response = await apiClient.get<CategoryResponse>(
      `${serviceRoute.detail}`,
      { params: { categoryId } }
    );
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<CategoryResponse[]>(serviceRoute.list);
    return response.data;
  },

  create: async (data: CategoryRequestCreate) => {
    const response = await apiClient.post<CategoryResponse>(
      serviceRoute.create,
      data
    );
    return response.data;
  },

  update: async (id: number, data: CategoryRequestCreate) => {
    const response = await apiClient.put<CategoryResponse>(
      serviceRoute.update,
      data,
      {
        params: { id },
      }
    );
    return response.data;
  },
};

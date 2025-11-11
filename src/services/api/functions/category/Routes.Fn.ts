import { CategoryResponse } from "src/shared/types/Reponse/category";
import apiClient from "../..";
import { categoryRoute } from "./Routes";

export const categoryRouteFn = {
  getCategories: async () => {
    const response = await apiClient.get<CategoryResponse[]>(
      categoryRoute.getCategories
    );
    return response.data;
  },
};

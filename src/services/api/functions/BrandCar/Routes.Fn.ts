import { BrandCarResponse } from "src/shared/types/Reponse/Car";
import apiClient from "../..";
import { brandCarRoute } from "./Routes";

export const brandCarRouteFn = {
  getBrandsCars: async () => {
    const response = await apiClient.get<BrandCarResponse[]>(
      brandCarRoute.getBrandsCars
    );
    return response.data;
  },
};

import { BodyCarReponse } from "src/shared/types/Reponse/Car";
import apiClient from "../..";
import { bodyCarRoute } from "./Routes";

export const bodyCarRouteFn = {
  getBodyCars: async () => {
    const response = await apiClient.get<BodyCarReponse[]>(
      bodyCarRoute.getBodyCars
    );
    return response.data;
  },
};

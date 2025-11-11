import { LocationResponse } from "src/shared/types/Reponse/Location";
import apiClient from "../..";
import { locationRoute } from "./Routes";

export const locationRouteFn = {
  getLocations: async () => {
    const response = await apiClient.get<LocationResponse[]>(
      locationRoute.getLocations
    );
    return response.data;
  },
};

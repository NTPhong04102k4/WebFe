import { LocationResponse } from "src/shared/types/Reponse/Location";
import type { OperationResult } from "src/services/types/common.types";
import apiClient from "../..";
import { locationRoute } from "./Routes";

function unwrapLocations(payload: LocationResponse[] | OperationResult<LocationResponse[]>) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapLocation(payload: LocationResponse | OperationResult<LocationResponse>) {
  return "data" in payload && payload.data ? payload.data : (payload as LocationResponse);
}

export const locationRouteFn = {
  getLocations: async () => {
    const response = await apiClient.get<LocationResponse[] | OperationResult<LocationResponse[]>>(
      locationRoute.getLocations
    );
    return unwrapLocations(response.data);
  },
  getLocation: async (ip: string) => {
    const response = await apiClient.get<LocationResponse | OperationResult<LocationResponse>>(
      locationRoute.getLocation,
      { params: { ip } }
    );
    return unwrapLocation(response.data);
  },
};

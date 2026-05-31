import { LocationResponse } from "src/shared/types/Reponse/Location";
import type { OperationResult } from "src/services/types/common.types";
import apiClient from "../..";
import { locationRoute } from "./Routes";

function normalizeLocation(loc: any): LocationResponse {
  return {
    ...loc,
    locationID: loc.locationID ?? loc.locationId ?? loc.id ?? 0,
  };
}

function extractArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  // OperationResult<T[]> hoặc PagedResult<T>
  const inner = payload.data ?? payload.items ?? [];
  if (Array.isArray(inner)) return inner;
  // OperationResult<PagedResult<T>>: { success, data: { data: [], totalCount } }
  if (inner && typeof inner === "object") {
    const nested = (inner as any).data ?? (inner as any).items ?? [];
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function unwrapLocations(payload: any) {
  return extractArray(payload).map(normalizeLocation);
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
  getLocation: async (id: number) => {
    const response = await apiClient.get<LocationResponse | OperationResult<LocationResponse>>(
      `${locationRoute.getLocation}/${id}`
    );
    return normalizeLocation(unwrapLocation(response.data));
  },
};

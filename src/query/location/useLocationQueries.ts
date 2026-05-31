import { useQuery } from "@tanstack/react-query";
import { locationRouteFn } from "src/services/api/functions/Location/Routes.Fn";
import { locationKeys } from "./keys";

export function useLocationList() {
  return useQuery({
    queryKey: locationKeys.lists(),
    queryFn: () => locationRouteFn.getLocations(),
    staleTime: 5 * 60_000,
  });
}

export function useLocationDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? locationKeys.detail(String(id)) : ["locations", "detail", "none"],
    queryFn: () => {
      if (id == null) throw new Error("Location ID is required");
      return locationRouteFn.getLocation(id);
    },
    enabled: id != null,
    staleTime: 5 * 60_000,
  });
}

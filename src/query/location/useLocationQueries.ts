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

export function useLocationDetail(ip: string | null) {
  return useQuery({
    queryKey: ip ? locationKeys.detail(ip) : ["locations", "detail", "none"],
    queryFn: () => {
      if (!ip) throw new Error("Location code is required");
      return locationRouteFn.getLocation(ip);
    },
    enabled: Boolean(ip),
    staleTime: 5 * 60_000,
  });
}

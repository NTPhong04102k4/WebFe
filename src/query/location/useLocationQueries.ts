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

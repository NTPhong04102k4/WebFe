import { useQuery } from "@tanstack/react-query";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { brandAccessoryKeys } from "./keys";

export function useBrandAccessoryList() {
  return useQuery({
    queryKey: brandAccessoryKeys.lists(),
    queryFn: () => brandRouteFn.getBrands(),
    staleTime: 5 * 60_000,
  });
}

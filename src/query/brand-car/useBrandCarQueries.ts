import { useQuery } from "@tanstack/react-query";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import { brandCarKeys } from "./keys";

export function useBrandCarList() {
  return useQuery({
    queryKey: brandCarKeys.lists(),
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 5 * 60_000,
  });
}

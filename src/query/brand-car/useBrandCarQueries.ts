import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LIST_STALE_MS } from "src/query/queryClient";
import {
  brandCarRouteFn,
  type BrandCarPayload,
} from "src/services/api/functions/BrandCar/Routes.Fn";
import { brandCarKeys } from "./keys";

export function useBrandCarList() {
  return useQuery({
    queryKey: brandCarKeys.lists(),
    queryFn: brandCarRouteFn.getBrandsCars,
    staleTime: LIST_STALE_MS,
    gcTime: 10 * 60_000,
  });
}

export function useBrandCarMutations() {
  const queryClient = useQueryClient();

  return {
    createBrandCar: useMutation({
      mutationFn: (data: BrandCarPayload) => brandCarRouteFn.createBrandCar(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: brandCarKeys.all }),
    }),
    updateBrandCar: useMutation({
      mutationFn: ({
        brandCode,
        data,
      }: {
        brandCode: string;
        data: BrandCarPayload;
      }) => brandCarRouteFn.updateBrandCar(brandCode, data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: brandCarKeys.all }),
    }),
  };
}

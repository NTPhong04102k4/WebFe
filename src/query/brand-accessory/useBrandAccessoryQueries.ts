import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import type {
  BrandRequestCreate,
  BrandRequestUpdate,
} from "src/shared/types/Request/accessories/brand";
import { brandAccessoryKeys } from "./keys";

export function useBrandAccessoryList() {
  return useQuery({
    queryKey: brandAccessoryKeys.lists(),
    queryFn: () => brandRouteFn.getBrands(),
    staleTime: 5 * 60_000,
  });
}

export function useBrandAccessoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: brandAccessoryKeys.all });

  return {
    createBrandAccessory: useMutation({
      mutationFn: (body: BrandRequestCreate) => brandRouteFn.createBrand(body),
      onSuccess: invalidate,
    }),
    updateBrandAccessory: useMutation({
      mutationFn: (body: BrandRequestUpdate) => brandRouteFn.updateBrand(body),
      onSuccess: invalidate,
    }),
  };
}

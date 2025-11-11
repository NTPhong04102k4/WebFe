import { useQuery } from "@tanstack/react-query";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";

export const useBrandAccessory = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    BrandAccessoryResponse[],
    Error
  >({
    queryKey: ["brand-accessories"],
    queryFn: async () => {
      const res = await brandRouteFn.getBrands();
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    brandAccessories: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

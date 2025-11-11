import { useQuery } from "@tanstack/react-query";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import { BrandCarResponse } from "src/shared/types/Reponse/Car";

export const useBrandCar = () => {
  const { data, isLoading, error, refetch, isFetching, isError } = useQuery<
    BrandCarResponse[],
    Error
  >({
    queryKey: ["brand-cars"],
    queryFn: async () => {
      const res = await brandCarRouteFn.getBrandsCars();
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    brandCar: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

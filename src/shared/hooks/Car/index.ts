import { useQuery } from "@tanstack/react-query";
import { carRouteFn } from "src/services/api/functions/car/Routes.Fn";
import { CarListRequest } from "src/shared/types/Request/car";

export const useCarList = (params: CarListRequest = {}) => {
  const queryKey: (string | number | null)[] = [
    "car-list",
    params.pageIndex ?? null,
    params.pageSize ?? null,
    params.bodyCode ?? null,
    params.brandCode ?? null,
    params.priceFrom ?? null,
    params.priceTo ?? null,
  ];

  const queryResult = useQuery({
    queryKey,
    queryFn: () => carRouteFn.getCars(params),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  return {
    raw: queryResult.data ?? { data: [], totalCount: 0 },
    data: queryResult.data?.data ?? [],
    totalCount: queryResult.data?.totalCount ?? 0,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};

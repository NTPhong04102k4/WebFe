import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";

export const useBrandCar = () => {
  const { data, isLoading, error, refetch, isFetching, isError } =
    useBrandCarList();

  return {
    brandCar: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

import { useQuery } from "@tanstack/react-query";
import { bodyCarRouteFn } from "src/services/api/functions/BodyCar/Routes.Fn";
import { BodyCarReponse } from "src/shared/types/Reponse/Car";

export const useBodyType = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    BodyCarReponse[],
    Error
  >({
    queryKey: ["body-types"],
    queryFn: async () => {
      const res = await bodyCarRouteFn.getBodyCars();
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    bodyTypes: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

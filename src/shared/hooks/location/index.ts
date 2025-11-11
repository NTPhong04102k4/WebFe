import { useQuery } from "@tanstack/react-query";
import { locationRouteFn } from "src/services/api/functions/Location/Routes.Fn";
import { LocationResponse } from "src/shared/types/Reponse/Location";

export const useLocation = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    LocationResponse[],
    Error
  >({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await locationRouteFn.getLocations();
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    locations: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

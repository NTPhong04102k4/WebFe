import { useQuery } from "@tanstack/react-query";
import { categoryRouteFn } from "src/services/api/functions/category/Routes.Fn";
import { CategoryResponse } from "src/shared/types/Reponse/category";

export const useCategory = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    CategoryResponse[],
    Error
  >({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryRouteFn.getCategories();
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    categories: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

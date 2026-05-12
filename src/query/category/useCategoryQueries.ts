import { useQuery } from "@tanstack/react-query";
import { categoryRouteFn } from "src/services/api/functions/category/Routes.Fn";
import { categoryKeys } from "./keys";

export function useCategoryList() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryRouteFn.getCategories(),
    staleTime: 5 * 60_000,
  });
}

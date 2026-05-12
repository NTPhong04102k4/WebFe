import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRouteFn } from "src/services/api/functions/Services/Routes.Fn";
import type { CategoryRequestCreate } from "src/shared/types/Request/Category";
import { serviceCategoryKeys } from "./keys";

export function useServiceCategoryList() {
  return useQuery({
    queryKey: serviceCategoryKeys.lists(),
    queryFn: () => serviceRouteFn.getAll(),
    staleTime: 2 * 60_000,
  });
}

export function useServiceCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? serviceCategoryKeys.detail(id) : ["service-categories", "detail", "none"],
    queryFn: () => {
      if (!id) throw new Error("Category ID is required");
      return serviceRouteFn.getDetail(id);
    },
    enabled: id != null,
    staleTime: 5 * 60_000,
  });
}

export function useServiceCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: serviceCategoryKeys.all });

  return {
    createCategory: useMutation({
      mutationFn: (body: CategoryRequestCreate) => serviceRouteFn.create(body),
      onSuccess: invalidate,
    }),
    updateCategory: useMutation({
      mutationFn: ({ id, data }: { id: number; data: CategoryRequestCreate }) =>
        serviceRouteFn.update(id, data),
      onSuccess: invalidate,
    }),
  };
}

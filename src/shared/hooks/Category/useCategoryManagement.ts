import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRouteFn } from "src/services/api/functions/Services/Routes.Fn";
import { CategoryResponse } from "src/shared/types/Reponse/category";
import { CategoryRequestCreate } from "src/shared/types/Request/Category";

// Query Keys
export const categoryQueryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryQueryKeys.all, "list"] as const,
  details: () => [...categoryQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...categoryQueryKeys.details(), id] as const,
};

// Hook for getting all categories
export const useCategoryList = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    CategoryResponse[],
    Error
  >({
    queryKey: categoryQueryKeys.lists(),
    queryFn: async () => {
      return await serviceRouteFn.getAll();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  return {
    categories: data ?? [],
    loading: isLoading || isFetching,
    error: isError ? error : null,
    refetch,
  };
};

// Hook for getting category detail
export const useCategoryDetail = (id: number | null) => {
  const { data, isLoading, isFetching, isError, error } = useQuery<
    CategoryResponse,
    Error
  >({
    queryKey: categoryQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error("Category ID is required");
      return await serviceRouteFn.getDetail(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    category: data,
    loading: isLoading || isFetching,
    error: isError ? error : null,
  };
};

// Hook for category mutations (create, update)
export const useCategoryMutation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
    CategoryResponse,
    Error,
    CategoryRequestCreate
  >({
    mutationFn: async (data) => {
      return await serviceRouteFn.create(data);
    },
    onSuccess: () => {
      // Invalidate category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
  });

  const updateMutation = useMutation<
    CategoryResponse,
    Error,
    { id: number; data: CategoryRequestCreate }
  >({
    mutationFn: async ({ id, data }) => {
      return await serviceRouteFn.update(id, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate specific category detail
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.detail(variables.id),
      });
      // Invalidate category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
  });

  return {
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { carRouteFn } from "src/services/api/functions/Cars/Routes.Fn";
import { SEARCH_STALE_MS } from "src/query/queryClient";
import { CarDetailResponse, CarResponse } from "src/shared/types/Reponse/Car";
import {
  CarDetailUpdateRequest,
  CarPagingRequest,
  TechSpecDetailUpdateRequest,
} from "src/shared/types/Request/Car";

// Query Keys
export const carQueryKeys = {
  all: ["cars"] as const,
  lists: () => [...carQueryKeys.all, "list"] as const,
  list: (params: CarPagingRequest) =>
    [...carQueryKeys.lists(), params] as const,
  details: () => [...carQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...carQueryKeys.details(), id] as const,
  techSpecs: () => [...carQueryKeys.all, "tech-spec"] as const,
  techSpec: (id: number) => [...carQueryKeys.techSpecs(), id] as const,
};

// Hook for getting car detail
export const useCarDetail = (id: number | null) => {
  return useQuery<CarDetailResponse, Error>({
    queryKey: carQueryKeys.detail(id!),
    queryFn: async ({ signal }) => {
      if (!id) throw new Error("Car ID is required");
      return await carRouteFn.getDetail(id, { signal });
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Hook for getting car list with paging
export const useCarList = (params: CarPagingRequest) => {
  return useQuery<CarResponse, Error>({
    queryKey: carQueryKeys.list(params),
    queryFn: async ({ signal }) => carRouteFn.getPaging(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });
};

// Hook for car mutations (create, update)
export const useCarMutation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
    CarDetailResponse,
    Error,
    { data: CarDetailUpdateRequest }
  >({
    mutationFn: async ({ data }, { signal }) => {
      return await carRouteFn.create(data, { signal });
    },
    onSuccess: () => {
      // Invalidate car lists to refetch
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() });
    },
  });

  const updateMutation = useMutation<
    CarDetailResponse,
    Error,
    { id: number; data: CarDetailUpdateRequest }
  >({
    mutationFn: async ({ id, data }, { signal }) => {
      return await carRouteFn.update(id, data, { signal });
    },
    onSuccess: (data, variables) => {
      // Invalidate specific car detail
      queryClient.invalidateQueries({
        queryKey: carQueryKeys.detail(variables.id),
      });
      // Invalidate car lists to refetch
      queryClient.invalidateQueries({ queryKey: carQueryKeys.lists() });
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

// Hook for car tech spec
export const useCarTechSpec = (carId: number | null) => {
  const queryClient = useQueryClient();

  const techSpecQuery = useQuery<CarDetailResponse, Error>({
    queryKey: carQueryKeys.techSpec(carId!),
    queryFn: async ({ signal }) => {
      if (!carId) throw new Error("Car ID is required");
      return await carRouteFn.getDetail(carId, { signal });
    },
    enabled: !!carId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createTechSpecMutation = useMutation<
    CarDetailResponse,
    Error,
    { id: number; data: TechSpecDetailUpdateRequest }
  >({
    mutationFn: async ({ id, data }, { signal }) => {
      return await carRouteFn.createTechSpec(id, data, { signal });
    },
    onSuccess: (data, variables) => {
      // Invalidate tech spec query
      queryClient.invalidateQueries({
        queryKey: carQueryKeys.techSpec(variables.id),
      });
      // Invalidate car detail
      queryClient.invalidateQueries({
        queryKey: carQueryKeys.detail(variables.id),
      });
    },
  });

  const updateTechSpecMutation = useMutation<
    CarDetailResponse,
    Error,
    { id: number; data: TechSpecDetailUpdateRequest }
  >({
    mutationFn: async ({ id, data }, { signal }) => {
      return await carRouteFn.updateTechSpec(id, data, { signal });
    },
    onSuccess: (data, variables) => {
      // Invalidate tech spec query
      queryClient.invalidateQueries({
        queryKey: carQueryKeys.techSpec(variables.id),
      });
      // Invalidate car detail
      queryClient.invalidateQueries({
        queryKey: carQueryKeys.detail(variables.id),
      });
    },
  });

  return {
    techSpec: techSpecQuery.data,
    isLoading: techSpecQuery.isLoading,
    isFetching: techSpecQuery.isFetching,
    error: techSpecQuery.error,
    refetch: techSpecQuery.refetch,
    createTechSpec: createTechSpecMutation.mutate,
    createTechSpecAsync: createTechSpecMutation.mutateAsync,
    isCreatingTechSpec: createTechSpecMutation.isPending,
    createTechSpecError: createTechSpecMutation.error,
    updateTechSpec: updateTechSpecMutation.mutate,
    updateTechSpecAsync: updateTechSpecMutation.mutateAsync,
    isUpdatingTechSpec: updateTechSpecMutation.isPending,
    updateTechSpecError: updateTechSpecMutation.error,
  };
};

// Combined hook for convenience
export const useCar = (id?: number | null) => {
  const detailQuery = useCarDetail(id ?? null);
  const mutations = useCarMutation();

  return {
    car: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isFetching: detailQuery.isFetching,
    error: detailQuery.error,
    refetch: detailQuery.refetch,
    ...mutations,
  };
};

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_STALE_MS } from "src/query/queryClient";
import { carRouteFn } from "src/services/api/functions/Cars/Routes.Fn";
import type {
  CarDetailUpdateRequest,
  CarPagingRequest,
  TechSpecDetailUpdateRequest,
} from "src/shared/types/Request/Car";
import { carKeys } from "./keys";

export function useCarList(params: CarPagingRequest) {
  return useQuery({
    queryKey: carKeys.list(params),
    queryFn: ({ signal }) => carRouteFn.getPaging(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useCarDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? carKeys.detail(id) : ["cars", "detail", "none"],
    queryFn: ({ signal }) => {
      if (!id) throw new Error("Car ID is required");
      return carRouteFn.getDetail(id, { signal });
    },
    enabled: id != null,
    staleTime: 5 * 60_000,
  });
}

export function useCarTechSpec(carId: number | null, enabled = true) {
  return useQuery({
    queryKey: carId != null ? carKeys.techSpec(carId) : ["cars", "tech-spec", "none"],
    queryFn: ({ signal }) => {
      if (!carId) throw new Error("Car ID is required");
      return carRouteFn.getTechSpec(carId, { signal });
    },
    enabled: carId != null && enabled,
    staleTime: 5 * 60_000,
    retry: (count, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 401) return false;
      return count < 1;
    },
  });
}

export function useCarMutations() {
  const qc = useQueryClient();

  return {
    createCar: useMutation({
      mutationFn: ({ data }: { data: CarDetailUpdateRequest }) =>
        carRouteFn.create(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: carKeys.lists() }),
    }),
    updateCar: useMutation({
      mutationFn: ({ id, data }: { id: number; data: CarDetailUpdateRequest }) =>
        carRouteFn.update(id, data),
      onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: carKeys.detail(variables.id) });
        qc.invalidateQueries({ queryKey: carKeys.lists() });
      },
    }),
    deleteCar: useMutation({
      mutationFn: (id: number) => carRouteFn.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: carKeys.lists() }),
    }),
  };
}

export function useCarTechSpecMutations() {
  const qc = useQueryClient();

  return {
    createTechSpec: useMutation({
      mutationFn: ({ id, data }: { id: number; data: TechSpecDetailUpdateRequest }) =>
        carRouteFn.createTechSpec(id, data),
      onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: carKeys.techSpec(variables.id) });
        qc.invalidateQueries({ queryKey: carKeys.detail(variables.id) });
      },
    }),
    updateTechSpec: useMutation({
      mutationFn: ({ id, data }: { id: number; data: TechSpecDetailUpdateRequest }) =>
        carRouteFn.updateTechSpec(id, data),
      onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: carKeys.techSpec(variables.id) });
        qc.invalidateQueries({ queryKey: carKeys.detail(variables.id) });
      },
    }),
  };
}

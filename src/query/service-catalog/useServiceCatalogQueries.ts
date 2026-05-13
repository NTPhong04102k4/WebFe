import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { serviceCatalogApi } from "src/services/api/functions/serviceCatalog/serviceCatalog.api";
import type {
  ServiceCatalogQuery,
  ServiceCatalogRequest,
  ServiceCatalogStatusRequest,
} from "src/services/api/functions/serviceCatalog/serviceCatalog.types";
import { serviceCatalogKeys } from "./keys";

export function useServiceCatalog(query: ServiceCatalogQuery) {
  return useQuery({
    queryKey: serviceCatalogKeys.list(query),
    queryFn: ({ signal }) => serviceCatalogApi.list(query, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useServiceCatalogDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? serviceCatalogKeys.detail(id) : ["serviceCatalog", "detail", "none"],
    queryFn: ({ signal }) => serviceCatalogApi.detail(id!, { signal }),
    enabled: id != null,
  });
}

export function useServiceCatalogMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: serviceCatalogKeys.all });

  return {
    createService: useMutation({
      mutationFn: (body: ServiceCatalogRequest) => serviceCatalogApi.create(body),
      onSuccess: invalidate,
    }),
    updateService: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ServiceCatalogRequest }) =>
        serviceCatalogApi.update(id, body),
      onSuccess: invalidate,
    }),
    patchServiceStatus: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ServiceCatalogStatusRequest }) =>
        serviceCatalogApi.patchStatus(id, body),
      onSuccess: invalidate,
    }),
    deleteService: useMutation({
      mutationFn: (id: number) => serviceCatalogApi.delete(id),
      onSuccess: invalidate,
    }),
  };
}

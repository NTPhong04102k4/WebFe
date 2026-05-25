import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LIST_STALE_MS } from "src/query/queryClient";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import type {
  AccessoryPagingRequest,
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import { accessoryKeys } from "./keys";

export function useAccessoryList(params: AccessoryPagingRequest) {
  return useQuery({
    queryKey: accessoryKeys.list(params),
    queryFn: () => accessoryRouteFn.getPaged(params),
    staleTime: LIST_STALE_MS,
  });
}

export function useAccessoryDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? accessoryKeys.detail(id) : ["accessories", "detail", "none"],
    queryFn: () => {
      if (!id) throw new Error("Accessory ID is required");
      return accessoryRouteFn.getDetail(id);
    },
    enabled: id != null,
    staleTime: LIST_STALE_MS,
  });
}

export function useAccessoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: accessoryKeys.all });

  return {
    createAccessory: useMutation({
      mutationFn: (body: AccessoryRequestCreate) => accessoryRouteFn.create(body),
      onSuccess: invalidate,
    }),
    updateAccessory: useMutation({
      mutationFn: ({ id, body }: { id: number; body: AccessoryRequestUpdate }) =>
        accessoryRouteFn.update(id, body),
      onSuccess: invalidate,
    }),
    deleteAccessory: useMutation({
      mutationFn: (id: number) => accessoryRouteFn.delete(id),
      onSuccess: invalidate,
    }),
  };
}

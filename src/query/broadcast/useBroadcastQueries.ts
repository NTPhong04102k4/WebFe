import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { broadcastApi } from "src/services/api/functions/broadcast/broadcast.api";
import type { BroadcastQueryRequest, BroadcastRequest } from "src/shared/types/Request/Broadcast";
import { broadcastKeys } from "./keys";

export function useBroadcastList(q: BroadcastQueryRequest) {
  return useQuery({
    queryKey: broadcastKeys.list(q),
    queryFn: ({ signal }) => broadcastApi.list(q, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBroadcastMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: broadcastKeys.all });

  const create = useMutation({
    mutationFn: (data: BroadcastRequest) => broadcastApi.create(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BroadcastRequest }) =>
      broadcastApi.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => broadcastApi.delete(id),
    onSuccess: invalidate,
  });

  const sendNow = useMutation({
    mutationFn: (id: number) => broadcastApi.sendNow(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, sendNow };
}

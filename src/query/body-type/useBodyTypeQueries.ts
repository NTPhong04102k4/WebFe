import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LIST_STALE_MS } from "src/query/queryClient";
import {
  bodyCarRouteFn,
  type BodyTypePayload,
} from "src/services/api/functions/BodyCar/Routes.Fn";
import { bodyTypeKeys } from "./keys";

export function useBodyTypeList() {
  return useQuery({
    queryKey: bodyTypeKeys.lists(),
    queryFn: bodyCarRouteFn.getBodyCars,
    staleTime: LIST_STALE_MS,
    gcTime: 10 * 60_000,
  });
}

export function useBodyTypeMutations() {
  const queryClient = useQueryClient();

  return {
    createBodyType: useMutation({
      mutationFn: (data: BodyTypePayload) => bodyCarRouteFn.createBodyType(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: bodyTypeKeys.all }),
    }),
    updateBodyType: useMutation({
      mutationFn: ({
        bodyCode,
        data,
      }: {
        bodyCode: string;
        data: BodyTypePayload;
      }) => bodyCarRouteFn.updateBodyType(bodyCode, data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: bodyTypeKeys.all }),
    }),
  };
}

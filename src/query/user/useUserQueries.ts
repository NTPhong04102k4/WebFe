import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { userRouteFn, type AdminUserUpdateRequest } from "src/services/api/functions/user/Routes.Fn";
import type { UserListQuery } from "src/shared/types/Reponse/auth/user";

import { userKeys } from "./keys";

export function useAdminUsers(query: UserListQuery) {
  return useQuery({
    queryKey: userKeys.adminList(query),
    queryFn: () => userRouteFn.getAdminUsers(query),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useUserDetail(gmailOrUserName: string | null) {
  return useQuery({
    queryKey: gmailOrUserName ? userKeys.detail(gmailOrUserName) : userKeys.detail(""),
    queryFn: () => userRouteFn.getUserByKey(gmailOrUserName!),
    enabled: Boolean(gmailOrUserName),
  });
}

export function useSendContactMutation() {
  return useMutation({
    mutationFn: (data: { subject: string; message: string }) =>
      userRouteFn.sendContactMessage(data),
  });
}

export function useAdminUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: userKeys.adminLists() });

  return {
    update: useMutation({
      mutationFn: ({ id, data }: { id: string | number; data: AdminUserUpdateRequest }) =>
        userRouteFn.updateAdminUser(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string | number) => userRouteFn.deleteAdminUser(id),
      onSuccess: invalidate,
    }),
  };
}

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { userRouteFn } from "src/services/api/functions/user/Routes.Fn";
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


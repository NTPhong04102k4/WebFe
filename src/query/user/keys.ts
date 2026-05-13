import type { UserListQuery } from "src/shared/types/Reponse/auth/user";

export const userKeys = {
  all: ["users"] as const,
  adminLists: () => [...userKeys.all, "admin-list"] as const,
  adminList: (query: UserListQuery) =>
    [...userKeys.adminLists(), query] as const,
  detail: (gmailOrUserName: string) =>
    [...userKeys.all, "detail", gmailOrUserName] as const,
};

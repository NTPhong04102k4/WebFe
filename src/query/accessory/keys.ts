import type { AccessoryPagingRequest } from "src/shared/types/Request/accessories/accessory";

export const accessoryKeys = {
  all: ["accessories"] as const,
  lists: () => [...accessoryKeys.all, "list"] as const,
  list: (params: AccessoryPagingRequest) => [...accessoryKeys.lists(), params] as const,
  details: () => [...accessoryKeys.all, "detail"] as const,
  detail: (id: number) => [...accessoryKeys.details(), id] as const,
};

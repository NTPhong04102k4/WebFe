import type { CarPagingRequest } from "src/shared/types/Request/Car";

export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (params: CarPagingRequest) => [...carKeys.lists(), params] as const,
  details: () => [...carKeys.all, "detail"] as const,
  detail: (id: number) => [...carKeys.details(), id] as const,
  techSpecs: () => [...carKeys.all, "tech-spec"] as const,
  techSpec: (id: number) => [...carKeys.techSpecs(), id] as const,
  statuses: () => [...carKeys.all, "statuses"] as const,
};

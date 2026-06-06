import type { BroadcastQueryRequest } from "src/shared/types/Request/Broadcast";

export const broadcastKeys = {
  all: ["broadcast"] as const,
  list: (q: BroadcastQueryRequest) => [...broadcastKeys.all, "list", q] as const,
  detail: (id: number) => [...broadcastKeys.all, "detail", id] as const,
};

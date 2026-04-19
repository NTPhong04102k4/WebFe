import { QueryClient } from "@tanstack/react-query";

/** List/search: ngắn hơn để filter đổi nhanh vẫn nhất quán; hợp với `placeholderData: keepPreviousData`. */
export const SEARCH_STALE_MS = 30_000;

/** Dữ liệu ít đổi (catalog, chi tiết). */
export const LIST_STALE_MS = 5 * 60_000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: LIST_STALE_MS,
        gcTime: 10 * 60_000,
      },
    },
  });
}

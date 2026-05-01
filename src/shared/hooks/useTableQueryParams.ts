import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type TableQueryKeys = {
  page: string;
  pageSize: string;
  search: string;
  status: string;
};

const DEFAULT_KEYS: TableQueryKeys = {
  page: "page",
  pageSize: "pageSize",
  search: "search",
  status: "status",
};

function parsePositiveInt(s: string | null, fallback: number) {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export type TableQueryParams = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
};

/**
 * Đồng bộ filter / phân trang bảng lên URL (F5 giữ trạng thái, copy link được).
 * Truyền `keys` khi một trang có nhiều bảng (vd. apptPage / woPage).
 */
export function useTableQueryParams(keys: Partial<TableQueryKeys> = {}) {
  const k = { ...DEFAULT_KEYS, ...keys };
  const [searchParams, setSearchParams] = useSearchParams();

  const params: TableQueryParams = useMemo(
    () => ({
      page: parsePositiveInt(searchParams.get(k.page), 1),
      pageSize: parsePositiveInt(searchParams.get(k.pageSize), 10),
      search: searchParams.get(k.search) ?? "",
      status: searchParams.get(k.status) ?? "",
    }),
    [searchParams, k.page, k.pageSize, k.search, k.status],
  );

  const setParams = useCallback(
    (newParams: Partial<TableQueryParams>) => {
      const updated = new URLSearchParams(searchParams);
      const entries: [keyof TableQueryParams, string][] = [
        ["page", k.page],
        ["pageSize", k.pageSize],
        ["search", k.search],
        ["status", k.status],
      ];
      for (const [logical, urlKey] of entries) {
        if (!(logical in newParams)) continue;
        const v = newParams[logical];
        if (v === undefined || v === null || v === "") {
          updated.delete(urlKey);
        } else {
          updated.set(urlKey, String(v));
        }
      }
      setSearchParams(updated, { replace: true });
    },
    [searchParams, setSearchParams, k.page, k.pageSize, k.search, k.status],
  );

  return { params, setParams };
}

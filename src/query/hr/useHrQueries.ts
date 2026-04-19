import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { hrApi } from "src/services/api/functions/hr/hr.api";
import type { TechnicianListParams } from "src/services/api/functions/hr/hr.types";

import { hrKeys } from "./keys";

export function useHrSkills() {
  return useQuery({
    queryKey: hrKeys.skills(),
    queryFn: ({ signal }) => hrApi.listSkills({ signal }),
    staleTime: 5 * 60_000,
  });
}

export function useHrTechniciansSearch(params: TechnicianListParams) {
  return useQuery({
    queryKey: hrKeys.technicianList(params),
    queryFn: ({ signal }) => hrApi.listTechnicians(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

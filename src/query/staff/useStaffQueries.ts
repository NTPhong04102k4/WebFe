import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { staffApi } from "src/services/api/functions/staff/staff.api";
import type {
  CreateStaffRequest,
  StaffListQuery,
  StaffStatusRequest,
  SuperAdminRecoverPasswordRequest,
  UpdateStaffPasswordRequest,
  UpdateStaffRequest,
} from "src/services/api/functions/staff/staff.types";
import { staffKeys } from "./keys";

export function useStaffList(query: StaffListQuery, enabled = true) {
  return useQuery({
    queryKey: staffKeys.list(query),
    queryFn: ({ signal }) => staffApi.list(query, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useStaffDetail(staffId: number | null) {
  return useQuery({
    queryKey: staffId != null ? staffKeys.detail(staffId) : ["staff", "detail", "none"],
    queryFn: ({ signal }) => staffApi.detail(staffId!, { signal }),
    enabled: staffId != null,
  });
}

export function useStaffMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: staffKeys.all });

  return {
    createStaff: useMutation({
      mutationFn: (body: CreateStaffRequest) => staffApi.create(body),
      onSuccess: invalidate,
    }),
    updateStaff: useMutation({
      mutationFn: ({ staffId, body }: { staffId: number; body: UpdateStaffRequest }) =>
        staffApi.update(staffId, body),
      onSuccess: invalidate,
    }),
    updateStaffPassword: useMutation({
      mutationFn: ({ staffId, body }: { staffId: number; body: UpdateStaffPasswordRequest }) =>
        staffApi.updatePassword(staffId, body),
    }),
    patchStaffStatus: useMutation({
      mutationFn: ({ staffId, body }: { staffId: number; body: StaffStatusRequest }) =>
        staffApi.patchStatus(staffId, body),
      onSuccess: invalidate,
    }),
    deleteStaff: useMutation({
      mutationFn: (staffId: number) => staffApi.delete(staffId),
      onSuccess: invalidate,
    }),
    recoverSuperAdminPassword: useMutation({
      mutationFn: (body: SuperAdminRecoverPasswordRequest) =>
        staffApi.recoverSuperAdminPassword(body),
    }),
  };
}

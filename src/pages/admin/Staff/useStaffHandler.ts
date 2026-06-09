import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useAuthStore } from "@/stores/authStore";
import { notify } from "src/components/core/Feedback/toast";
import { useLocationList } from "src/query/location/useLocationQueries";
import {
  useStaffList,
  useStaffMutations,
} from "src/query/staff/useStaffQueries";
import type {
  CreateStaffRequest,
  StaffListQuery,
  StaffResponse,
  SuperAdminRecoverPasswordRequest,
  UpdateStaffRequest,
} from "src/services/api/functions/staff/staff.types";
import type { LocationResponse } from "src/shared/types/Reponse/Location";

import {
  DEFAULT_PAGE_SIZE,
  isActiveStaff,
  staffDefaults,
  staffIdOf,
  type PasswordForm,
  type RecoveryForm,
  type StaffForm,
} from "./staffHelpers";

export type StaffHandlerReturn = {
  rows: StaffResponse[];
  totalCount: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
  isLoading: boolean;
  locations: LocationResponse[];
  locationsLoading: boolean;
  currentUserId: number | undefined;
  query: StaffListQuery;
  setPage: (page: number) => void;
  mutations: ReturnType<typeof useStaffMutations>;

  draft: { keyword: string; roleID: string; locationID: string; isActive: string };
  setDraftField: (field: keyof StaffHandlerReturn["draft"], value: string) => void;
  applyFilter: () => void;
  clearFilter: () => void;

  formOpen: boolean;
  editing: StaffResponse | null;
  openCreate: () => void;
  openEdit: (staff: StaffResponse) => void;
  closeForm: () => void;
  form: UseFormReturn<StaffForm>;
  onSaveStaff: () => void;

  passwordTarget: StaffResponse | null;
  openPassword: (staff: StaffResponse) => void;
  closePassword: () => void;
  passwordForm: UseFormReturn<PasswordForm>;
  onSavePassword: () => void;

  recoveryOpen: boolean;
  openRecovery: () => void;
  closeRecovery: () => void;
  recoveryForm: UseFormReturn<RecoveryForm>;
  onRecoverSuperAdmin: () => void;

  confirmDeleteStaff: StaffResponse | null;
  setConfirmDeleteStaff: (staff: StaffResponse | null) => void;
  onDeleteStaff: () => Promise<void>;

  onToggleStatus: (staff: StaffResponse) => Promise<void>;
};

export function useStaffHandler(): StaffHandlerReturn {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = Number(currentUser?.id ?? currentUser?.userID ?? 0) || undefined;

  const [query, setQuery] = useState<StaffListQuery>({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const [draft, setDraft] = useState({ keyword: "", roleID: "", locationID: "", isActive: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffResponse | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StaffResponse | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<StaffResponse | null>(null);

  const { data, isLoading } = useStaffList(query);
  const { data: locations = [], isLoading: locationsLoading } = useLocationList();
  const mutations = useStaffMutations();

  const form = useForm<StaffForm>({ defaultValues: staffDefaults });
  const passwordForm = useForm<PasswordForm>({ defaultValues: { currentPassword: "", newPassword: "" } });
  const recoveryForm = useForm<RecoveryForm>({ defaultValues: { recoveryCode: "", newPassword: "", confirmPassword: "" } });

  const rows = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / (query.pageSize ?? DEFAULT_PAGE_SIZE)));
  const activeCount = rows.filter(isActiveStaff).length;
  const inactiveCount = rows.length - activeCount;

  const applyFilter = () => {
    setQuery({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      keyword: draft.keyword.trim() || undefined,
      roleID: draft.roleID ? Number(draft.roleID) : undefined,
      locationID: draft.locationID ? Number(draft.locationID) : undefined,
      isActive: draft.isActive === "" ? undefined : draft.isActive === "true",
    });
  };

  const clearFilter = () => {
    setDraft({ keyword: "", roleID: "", locationID: "", isActive: "" });
    setQuery({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  };

  const openCreate = () => {
    setEditing(null);
    form.reset(staffDefaults);
    setFormOpen(true);
  };

  const openEdit = (staff: StaffResponse) => {
    setEditing(staff);
    form.reset({
      username: staff.username,
      email: staff.email,
      password: "",
      fullName: staff.fullName,
      phone: staff.phone,
      locationID: staff.locationID != null ? String(staff.locationID) : "",
      roleID: staff.roleID != null ? String(staff.roleID) : "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
    form.reset(staffDefaults);
  };

  const saveStaff = async (values: StaffForm) => {
    const locationID = Number(values.locationID);
    const roleID = Number(values.roleID);
    if (!locationID) {
      form.setError("locationID", { message: "Vui lòng chọn chi nhánh" });
      return;
    }
    if (!roleID) {
      form.setError("roleID", { message: "Vui lòng chọn chức vụ" });
      return;
    }
    try {
      if (editing) {
        const body: UpdateStaffRequest = {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          locationID,
          roleID,
        };
        await mutations.updateStaff.mutateAsync({ staffId: staffIdOf(editing), body });
        notify.success("Đã cập nhật nhân viên");
      } else {
        const body: CreateStaffRequest = {
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          locationID,
          roleID,
          createBy: currentUserId ?? 0,
        };
        await mutations.createStaff.mutateAsync(body);
        notify.success("Đã tạo nhân viên");
      }
      closeForm();
    } catch {
      // interceptor handles toast
    }
  };

  const onToggleStatus = async (staff: StaffResponse) => {
    try {
      await mutations.patchStaffStatus.mutateAsync({
        staffId: staffIdOf(staff),
        body: { isActive: !isActiveStaff(staff) },
      });
      notify.success("Đã cập nhật trạng thái");
    } catch {
      // interceptor handles toast
    }
  };

  const onDeleteStaff = async () => {
    if (!confirmDeleteStaff) return;
    try {
      await mutations.deleteStaff.mutateAsync(staffIdOf(confirmDeleteStaff));
      notify.success("Đã xóa nhân viên");
      setConfirmDeleteStaff(null);
    } catch {
      // interceptor handles toast
    }
  };

  const savePassword = async (values: PasswordForm) => {
    if (!passwordTarget) return;
    try {
      await mutations.updateStaffPassword.mutateAsync({
        staffId: staffIdOf(passwordTarget),
        body: {
          currentPassword: values.currentPassword || null,
          newPassword: values.newPassword,
        },
      });
      notify.success("Đã đổi mật khẩu");
      setPasswordTarget(null);
      passwordForm.reset();
    } catch {
      // interceptor handles toast
    }
  };

  const recoverSuperAdmin = async (values: RecoveryForm) => {
    if (values.newPassword !== values.confirmPassword) {
      notify.info("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      const body: SuperAdminRecoverPasswordRequest = {
        recoveryCode: values.recoveryCode,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      await mutations.recoverSuperAdminPassword.mutateAsync(body);
      notify.success("Đã đặt lại mật khẩu SuperAdmin");
      setRecoveryOpen(false);
      recoveryForm.reset();
    } catch {
      // interceptor handles toast
    }
  };

  return {
    rows,
    totalCount,
    totalPages,
    activeCount,
    inactiveCount,
    isLoading,
    locations,
    locationsLoading,
    currentUserId,
    query,
    setPage: (page) => setQuery((s) => ({ ...s, page })),
    mutations,

    draft,
    setDraftField: (field, value) => setDraft((s) => ({ ...s, [field]: value })),
    applyFilter,
    clearFilter,

    formOpen,
    editing,
    openCreate,
    openEdit,
    closeForm,
    form,
    onSaveStaff: form.handleSubmit(saveStaff),

    passwordTarget,
    openPassword: (staff) => {
      setPasswordTarget(staff);
      passwordForm.reset({ currentPassword: "", newPassword: "" });
    },
    closePassword: () => setPasswordTarget(null),
    passwordForm,
    onSavePassword: passwordForm.handleSubmit(savePassword),

    recoveryOpen,
    openRecovery: () => setRecoveryOpen(true),
    closeRecovery: () => setRecoveryOpen(false),
    recoveryForm,
    onRecoverSuperAdmin: recoveryForm.handleSubmit(recoverSuperAdmin),

    confirmDeleteStaff,
    setConfirmDeleteStaff,
    onDeleteStaff,

    onToggleStatus,
  };
}

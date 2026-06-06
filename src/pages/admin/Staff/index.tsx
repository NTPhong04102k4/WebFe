import { useMemo, useState, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable, Input, Modal } from "@/components/common";
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
  ActionButton,
  Badge,
  formatDate,
  getErrorMessage,
  PageHeader,
} from "../Workshop/workshopUi";

type StaffForm = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  locationID: string;
  roleID: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
};

type RecoveryForm = {
  recoveryCode: string;
  newPassword: string;
  confirmPassword: string;
};

type LocationOption = LocationResponse & {
  locationID?: number;
  id?: number;
};

const ROLE_OPTIONS = [
  { value: "1", label: "SuperAdmin" },
  { value: "2", label: "Admin" },
  { value: "3", label: "Staff" },
] as const;

const DEFAULT_PAGE_SIZE = 20;

const staffDefaults: StaffForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  locationID: "",
  roleID: "3",
};

function staffIdOf(staff: StaffResponse) {
  return staff.staffID ?? staff.id ?? 0;
}

function locationIdOf(location: LocationOption, index: number) {
  return location.locationID ?? location.id ?? index + 1;
}

function isActiveStaff(staff: StaffResponse) {
  return staff.isActive !== false;
}

function roleNameOf(staff: StaffResponse) {
  return staff.roleName ?? staff.role ?? `Role #${staff.roleID ?? "-"}`;
}

function locationNameOf(staff: StaffResponse) {
  return staff.locationName ?? staff.location ?? `Location #${staff.locationID ?? "-"}`;
}

function sameStaff(currentUserId: number | undefined, staff: StaffResponse) {
  return currentUserId != null && currentUserId === staffIdOf(staff);
}

function SelectBox({
  label,
  value,
  onChange,
  children,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-300 dark:disabled:bg-slate-800"
      >
        {children}
      </select>
    </label>
  );
}

function MetricCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  tone?: "slate" | "green" | "blue" | "red";
}) {
  const tones = {
    slate: "bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    green:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100",
    blue: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100",
    red: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-100",
  }[tone];

  return (
    <div className={`rounded-lg border border-slate-200 p-4 dark:border-slate-700 ${tones}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-75">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function StaffPage() {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = Number(currentUser?.id ?? currentUser?.userID ?? 0) || undefined;
  const [query, setQuery] = useState<StaffListQuery>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [draft, setDraft] = useState({
    keyword: "",
    roleID: "",
    locationID: "",
    isActive: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [editing, setEditing] = useState<StaffResponse | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StaffResponse | null>(null);
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<StaffResponse | null>(null);

  const { data, isLoading } = useStaffList(query);
  const { data: locations = [], isLoading: locationsLoading } = useLocationList();
  const mutations = useStaffMutations();
  const form = useForm<StaffForm>({ defaultValues: staffDefaults });
  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  const recoveryForm = useForm<RecoveryForm>({
    defaultValues: { recoveryCode: "", newPassword: "", confirmPassword: "" },
  });

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
    if (!locationID || !roleID) {
      notify.info("Vui lòng chọn chi nhánh và chức vụ hợp lệ");
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
      // interceptor đã hiện toast lỗi
    }
  };

  const toggleStatus = async (staff: StaffResponse) => {
    try {
      await mutations.patchStaffStatus.mutateAsync({
        staffId: staffIdOf(staff),
        body: { isActive: !isActiveStaff(staff) },
      });
      notify.success("Đã cập nhật trạng thái");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const deleteStaff = async (staff: StaffResponse) => {
    try {
      await mutations.deleteStaff.mutateAsync(staffIdOf(staff));
      notify.success("Đã xóa nhân viên");
      setConfirmDeleteStaff(null);
    } catch {
      // interceptor đã hiện toast lỗi
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
      // interceptor đã hiện toast lỗi
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
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<StaffResponse>[]>(
    () => [
      {
        header: "Staff",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {row.original.fullName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {row.original.staffCode || `#${staffIdOf(row.original)}`} - {row.original.username}
            </div>
          </div>
        ),
      },
      { header: "Email", accessorKey: "email" },
      { header: "Phone", accessorKey: "phone" },
      {
        header: "Role",
        cell: ({ row }) => (
          <Badge tone={roleNameOf(row.original) === "SuperAdmin" ? "red" : roleNameOf(row.original) === "Admin" ? "blue" : "slate"}>
            {roleNameOf(row.original)}
          </Badge>
        ),
      },
      {
        header: "Location",
        cell: ({ row }) => locationNameOf(row.original),
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <Badge tone={isActiveStaff(row.original) ? "green" : "slate"}>
            {isActiveStaff(row.original) ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        header: "Thao tac",
        enableSorting: false,
        cell: ({ row }) => {
          const staff = row.original;
          const isSelf = sameStaff(currentUserId, staff);
          return (
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => openEdit(staff)}>Sửa</ActionButton>
              <ActionButton
                onClick={() => {
                  setPasswordTarget(staff);
                  passwordForm.reset({ currentPassword: "", newPassword: "" });
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Mật khẩu
              </ActionButton>
              <ActionButton disabled={isSelf} onClick={() => toggleStatus(staff)}>
                {isActiveStaff(staff) ? (
                  <Lock className="mr-2 h-4 w-4" />
                ) : (
                  <Unlock className="mr-2 h-4 w-4" />
                )}
                {isActiveStaff(staff) ? "Khóa" : "Mở"}
              </ActionButton>
              <ActionButton variant="danger" disabled={isSelf} onClick={() => setConfirmDeleteStaff(staff)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </ActionButton>
            </div>
          );
        },
      },
    ],
    [currentUserId, passwordForm]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý Nhân viên"
        description="Tạo, cập nhật, khóa/mở khóa, đổi mật khẩu và xóa nhân viên/admin."
        action={
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => setRecoveryOpen(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Recover SuperAdmin
            </ActionButton>
            <ActionButton variant="primary" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tao staff
            </ActionButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Tổng nhân viên" value={totalCount} tone="blue" />
        <MetricCard label="Đang hoạt động" value={activeCount} tone="green" />
        <MetricCard label="Đã khóa" value={inactiveCount} tone="red" />
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
        <Input
          label="Từ khóa"
          value={draft.keyword}
          onChange={(event) =>
            setDraft((state) => ({ ...state, keyword: event.target.value }))
          }
          placeholder="Tên, username, email"
        />
        <SelectBox
          label="Role"
          value={draft.roleID}
          onChange={(value) => setDraft((state) => ({ ...state, roleID: value }))}
        >
          <option value="">Tat ca</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </SelectBox>
        <SelectBox
          label="Location"
          value={draft.locationID}
          disabled={locationsLoading}
          onChange={(value) =>
            setDraft((state) => ({ ...state, locationID: value }))
          }
        >
          <option value="">Tat ca</option>
          {locations.map((location, index) => {
            const id = locationIdOf(location as LocationOption, index);
            return (
              <option key={`${location.locationCode}-${id}`} value={id}>
                {location.locationName}
              </option>
            );
          })}
        </SelectBox>
        <SelectBox
          label="Trạng thái"
          value={draft.isActive}
          onChange={(value) => setDraft((state) => ({ ...state, isActive: value }))}
        >
          <option value="">Tất cả</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã khóa</option>
        </SelectBox>
        <div className="flex items-end gap-2">
          <ActionButton variant="primary" onClick={applyFilter}>
            <Search className="mr-2 h-4 w-4" />
            Lọc
          </ActionButton>
          <ActionButton onClick={clearFilter}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Xóa lọc
          </ActionButton>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => String(staffIdOf(row))}
        loading={isLoading}
        emptyTitle="Chưa có nhân viên"
        emptyDescription="Thử thay đổi bộ lọc hoặc tạo nhân viên mới."
        enablePagination={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          Tổng {totalCount} nhân viên
        </span>
        <div className="flex items-center gap-2">
          <ActionButton
            disabled={(query.page ?? 1) <= 1}
            onClick={() =>
              setQuery((state) => ({ ...state, page: (state.page ?? 1) - 1 }))
            }
          >
            Trước
          </ActionButton>
          <span className="px-2 py-2">
            Trang {query.page ?? 1}/{totalPages}
          </span>
          <ActionButton
            disabled={(query.page ?? 1) >= totalPages}
            onClick={() =>
              setQuery((state) => ({ ...state, page: (state.page ?? 1) + 1 }))
            }
          >
            Sau
          </ActionButton>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Cập nhật nhân viên" : "Tạo nhân viên mới"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={closeForm}>Huỷ</ActionButton>
            <ActionButton
              variant="primary"
              onClick={form.handleSubmit(saveStaff)}
              disabled={mutations.createStaff.isPending || mutations.updateStaff.isPending}
            >
              Lưu
            </ActionButton>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            required={!editing}
            disabled={Boolean(editing)}
            {...form.register("username", { required: !editing })}
          />
          <Input
            label="Email"
            type="email"
            required
            {...form.register("email", { required: true })}
          />
          {!editing ? (
            <Input
              label="Password"
              type="password"
              required
              {...form.register("password", { required: true })}
            />
          ) : null}
          <Input label="Ho ten" required {...form.register("fullName", { required: true })} />
          <Input label="Phone" required {...form.register("phone", { required: true })} />
          <SelectBox
            label="Location"
            value={form.watch("locationID")}
            required
            disabled={locationsLoading}
            onChange={(value) => form.setValue("locationID", value, { shouldDirty: true })}
          >
            <option value="">Chon location</option>
            {locations.map((location, index) => {
              const id = locationIdOf(location as LocationOption, index);
              return (
                <option key={`${location.locationCode}-${id}`} value={id}>
                  {location.locationName}
                </option>
              );
            })}
          </SelectBox>
          <SelectBox
            label="Role"
            value={form.watch("roleID")}
            required
            onChange={(value) => form.setValue("roleID", value, { shouldDirty: true })}
          >
            <option value="">Chon role</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
            {editing?.roleID && !ROLE_OPTIONS.some((role) => role.value === String(editing.roleID)) ? (
              <option value={editing.roleID}>{roleNameOf(editing)}</option>
            ) : null}
          </SelectBox>
        </div>
      </Modal>

      <Modal
        open={passwordTarget !== null}
        onClose={() => setPasswordTarget(null)}
        title={`Đổi mật khẩu${passwordTarget ? ` — ${passwordTarget.fullName}` : ""}`}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setPasswordTarget(null)}>Huỷ</ActionButton>
            <ActionButton
              variant="primary"
              onClick={passwordForm.handleSubmit(savePassword)}
              disabled={mutations.updateStaffPassword.isPending}
            >
              Lưu
            </ActionButton>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            helperText="Bắt buộc khi đổi mật khẩu của chính mình. SuperAdmin đổi cho người khác có thể để trống."
            {...passwordForm.register("currentPassword")}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            required
            {...passwordForm.register("newPassword", { required: true })}
          />
        </div>
      </Modal>

      <Modal
        open={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
        title="Khôi phục mật khẩu SuperAdmin"
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setRecoveryOpen(false)}>Huỷ</ActionButton>
            <ActionButton
              variant="primary"
              onClick={recoveryForm.handleSubmit(recoverSuperAdmin)}
              disabled={mutations.recoverSuperAdminPassword.isPending}
            >
              Đặt lại mật khẩu
            </ActionButton>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Recovery code"
            type="password"
            required
            {...recoveryForm.register("recoveryCode", { required: true })}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            required
            {...recoveryForm.register("newPassword", { required: true })}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            required
            {...recoveryForm.register("confirmPassword", { required: true })}
          />
        </div>
      </Modal>

      {/* Confirm xóa nhân viên */}
      {confirmDeleteStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Xác nhận xóa nhân viên</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Bạn có chắc muốn xóa nhân viên{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmDeleteStaff.fullName}
                </span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <ActionButton onClick={() => setConfirmDeleteStaff(null)} disabled={mutations.deleteStaff.isPending}>
                Huỷ
              </ActionButton>
              <ActionButton variant="danger" disabled={mutations.deleteStaff.isPending} onClick={() => deleteStaff(confirmDeleteStaff)}>
                {mutations.deleteStaff.isPending ? "Đang xóa..." : "Xóa"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

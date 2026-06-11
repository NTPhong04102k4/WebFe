import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, Lock, Plus, ShieldCheck, Trash2, Unlock } from "lucide-react";

import { DataTable } from "@/components/common";
import type { StaffResponse } from "src/services/api/functions/staff/staff.types";
import {
  ActionButton,
  Badge,
  formatDate,
  PageHeader,
} from "../Workshop/workshopUi";
import { StaffDeleteModal } from "./components/StaffDeleteModal";
import { StaffFilters } from "./components/StaffFilters";
import { StaffFormModal } from "./components/StaffFormModal";
import { StaffPasswordModal } from "./components/StaffPasswordModal";
import { StaffRecoveryModal } from "./components/StaffRecoveryModal";
import {
  isActiveStaff,
  locationNameOf,
  roleNameOf,
  sameStaff,
  staffIdOf,
} from "./staffHelpers";
import { useStaffHandler } from "./useStaffHandler";

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
    green: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100",
    blue: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100",
    red: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-100",
  }[tone];

  return (
    <div className={`rounded-lg border border-slate-200 p-4 dark:border-slate-700 ${tones}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function StaffPage() {
  const h = useStaffHandler();

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
              {row.original.staffCode || `#${staffIdOf(row.original)}`} -{" "}
              {row.original.username}
            </div>
          </div>
        ),
      },
      { header: "Email", accessorKey: "email" },
      { header: "Phone", accessorKey: "phone" },
      {
        header: "Role",
        cell: ({ row }) => (
          <Badge
            tone={
              roleNameOf(row.original) === "SuperAdmin"
                ? "red"
                : roleNameOf(row.original) === "Admin"
                  ? "blue"
                  : "slate"
            }
          >
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
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => {
          const staff = row.original;
          const isSelf = sameStaff(h.currentUserId, staff);
          return (
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => h.openEdit(staff)}>Sửa</ActionButton>
              <ActionButton onClick={() => h.openPassword(staff)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Mật khẩu
              </ActionButton>
              <ActionButton disabled={isSelf} onClick={() => h.onToggleStatus(staff)}>
                {isActiveStaff(staff) ? (
                  <Lock className="mr-2 h-4 w-4" />
                ) : (
                  <Unlock className="mr-2 h-4 w-4" />
                )}
                {isActiveStaff(staff) ? "Khóa" : "Mở"}
              </ActionButton>
              <ActionButton
                variant="danger"
                disabled={isSelf}
                onClick={() => h.setConfirmDeleteStaff(staff)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </ActionButton>
            </div>
          );
        },
      },
    ],
    [h]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý Nhân viên"
        description="Tạo, cập nhật, khóa/mở khóa, đổi mật khẩu và xóa nhân viên/admin."
        action={
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={h.openRecovery}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Recover SuperAdmin
            </ActionButton>
            <ActionButton variant="primary" onClick={h.openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo staff
            </ActionButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Tổng nhân viên" value={h.totalCount} tone="blue" />
        <MetricCard label="Đang hoạt động" value={h.activeCount} tone="green" />
        <MetricCard label="Đã khóa" value={h.inactiveCount} tone="red" />
      </div>

      <StaffFilters
        draft={h.draft}
        locations={h.locations}
        locationsLoading={h.locationsLoading}
        onDraftChange={h.setDraftField}
        onApply={h.applyFilter}
        onClear={h.clearFilter}
      />

      <DataTable
        data={h.rows}
        columns={columns}
        getRowId={(row) => String(staffIdOf(row))}
        loading={h.isLoading}
        emptyTitle="Chưa có nhân viên"
        emptyDescription="Thử thay đổi bộ lọc hoặc tạo nhân viên mới."
        enablePagination={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>Tổng {h.totalCount} nhân viên</span>
        <div className="flex items-center gap-2">
          <ActionButton
            disabled={(h.query.page ?? 1) <= 1}
            onClick={() => h.setPage((h.query.page ?? 1) - 1)}
          >
            Trước
          </ActionButton>
          <span className="px-2 py-2">
            Trang {h.query.page ?? 1}/{h.totalPages}
          </span>
          <ActionButton
            disabled={(h.query.page ?? 1) >= h.totalPages}
            onClick={() => h.setPage((h.query.page ?? 1) + 1)}
          >
            Sau
          </ActionButton>
        </div>
      </div>

      <StaffFormModal
        open={h.formOpen}
        editing={h.editing}
        locations={h.locations}
        locationsLoading={h.locationsLoading}
        form={h.form}
        onSave={h.onSaveStaff}
        onClose={h.closeForm}
        isSavePending={h.mutations.createStaff.isPending || h.mutations.updateStaff.isPending}
      />

      <StaffPasswordModal
        target={h.passwordTarget}
        form={h.passwordForm}
        onSave={h.onSavePassword}
        onClose={h.closePassword}
        isPending={h.mutations.updateStaffPassword.isPending}
      />

      <StaffRecoveryModal
        open={h.recoveryOpen}
        form={h.recoveryForm}
        onSave={h.onRecoverSuperAdmin}
        onClose={h.closeRecovery}
        isPending={h.mutations.recoverSuperAdminPassword.isPending}
      />

      <StaffDeleteModal
        target={h.confirmDeleteStaff}
        onConfirm={h.onDeleteStaff}
        onClose={() => h.setConfirmDeleteStaff(null)}
        isPending={h.mutations.deleteStaff.isPending}
      />
    </div>
  );
}

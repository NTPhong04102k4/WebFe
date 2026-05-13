import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/common";
import type { UserProfile } from "src/shared/types/Reponse/auth/user";

type UserTableProps = {
  users: UserProfile[];
  loading: boolean;
  onView: (user: UserProfile) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function displayName(user: UserProfile) {
  return user.fullName || user.username || user.email || user.userID;
}

function statusClass(user: UserProfile) {
  if (user.isLocked) return "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300";
  if (!user.isActive) return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
  return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
}

function statusLabel(user: UserProfile) {
  if (user.isLocked) return "Bi khoa";
  if (!user.isActive) return "Tam dung";
  return "Dang hoat dong";
}

export function UserTable({ users, loading, onView }: UserTableProps) {
  const columns = useMemo<ColumnDef<UserProfile>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Nguoi dung",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                {user.image ? (
                  <img className="h-full w-full object-cover" src={user.image} alt={displayName(user)} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-100">
                    {displayName(user).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName(user)}</div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-300">@{user.username}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <div className="truncate">{row.original.email || "-"}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {row.original.emailVerified ? "Da xac thuc" : "Chua xac thuc"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "isActive",
        header: "Trang thai",
        cell: ({ row }) => (
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.original)}`}>
            {statusLabel(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "createdDate",
        header: "Ngay tao",
        cell: ({ getValue }) => formatDate(String(getValue() || "")),
      },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-blue-300/30"
              onClick={() => onView(row.original)}
            >
              Chi tiet
            </button>
          </div>
        ),
      },
    ],
    [onView]
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      getRowId={(user) => user.userUUID ?? user.userID}
      emptyTitle="Khong co nguoi dung"
      emptyDescription="Chua co nguoi dung phu hop voi bo loc."
    />
  );
}

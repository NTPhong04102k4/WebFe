import { RefreshCw } from "lucide-react";

import { ComboBox, DateTimePicker, Input } from "src/components/common";
import { SelectField } from "@/shared/components/Form/SelectField";
import type {
  UserListPeriod,
  UserListQuery,
} from "src/shared/types/Reponse/auth/user";

import type { UserStatusFilter } from "../customHookModule/useUserManagement";

type UserToolbarProps = {
  search: string;
  email: string;
  username: string;
  phone: string;
  period: UserListPeriod;
  statusFilters: UserStatusFilter[];
  fromDate: string;
  toDate: string;
  sortBy: UserListQuery["sortBy"];
  sortDir: UserListQuery["sortDir"];
  isSyncing: boolean;
  onSearchChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPeriodChange: (value: UserListPeriod) => void;
  onStatusFiltersChange: (value: UserStatusFilter[]) => void;
  onDateRangeChange: (value: { fromDate: string; toDate: string }) => void;
  onSortByChange: (value: UserListQuery["sortBy"]) => void;
  onSortDirChange: (value: UserListQuery["sortDir"]) => void;
  onRefresh: () => void;
};

const statusOptions = [
  { label: "Dang hoat dong", value: "active" },
  { label: "Tam dung", value: "inactive" },
  { label: "Bi khoa", value: "locked" },
  { label: "Khong bi khoa", value: "unlocked" },
];

const periodOptions = [
  { label: "7 ngay gan day", value: "7d" },
  { label: "30 ngay gan day", value: "30d" },
  { label: "Khoang ngay tuy chon", value: "custom" },
];

const sortByOptions = [
  { label: "Ngay tao", value: "createdDate" },
  { label: "Ngay cap nhat", value: "updatedDate" },
  { label: "Dang nhap cuoi", value: "lastLoginDate" },
  { label: "Username", value: "username" },
];

const sortDirOptions = [
  { label: "Moi nhat", value: "desc" },
  { label: "Cu nhat", value: "asc" },
];

export function UserToolbar({
  search,
  email,
  username,
  phone,
  period,
  statusFilters,
  fromDate,
  toDate,
  sortBy,
  sortDir,
  isSyncing,
  onSearchChange,
  onEmailChange,
  onUsernameChange,
  onPhoneChange,
  onPeriodChange,
  onStatusFiltersChange,
  onDateRangeChange,
  onSortByChange,
  onSortDirChange,
  onRefresh,
}: UserToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Quan ly nguoi dung
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Theo doi tai khoan theo email, username, phone va trang thai hoat
            dong
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-blue-300/30"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Tai lai
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Input
          label="Tim kiem chung"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tim email, username, phone..."
        />
        <SelectField
          label="Thoi gian"
          value={period}
          placeholder="Tat ca thoi gian"
          options={periodOptions}
          onChange={(event) => onPeriodChange((event.target.value || "all") as UserListPeriod)}
          className="border-2 border-slate-400 bg-white text-slate-800 focus:border-blue-600 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
        />
        <ComboBox
          label="Trang thai"
          value={statusFilters}
          valueCollection={statusOptions}
          placeholder="Tat ca trang thai"
          onChange={(value) =>
            onStatusFiltersChange(value as UserStatusFilter[])
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Sap xep"
            value={sortBy}
            placeholder="Ngay tao"
            options={sortByOptions}
            onChange={(event) =>
              onSortByChange((event.target.value || "createdDate") as UserListQuery["sortBy"])
            }
            className="border-2 border-slate-400 bg-white text-slate-800 focus:border-blue-600 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
          />
          <SelectField
            label="Huong"
            value={sortDir}
            placeholder="Moi nhat"
            options={sortDirOptions}
            onChange={(event) =>
              onSortDirChange((event.target.value || "desc") as UserListQuery["sortDir"])
            }
            className="border-2 border-slate-400 bg-white text-slate-800 focus:border-blue-600 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Input
          label="Email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Loc rieng theo email"
        />
        <Input
          label="Username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="Loc rieng theo username"
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="Loc rieng theo phone"
        />
        {isSyncing ? (
          <span className="self-center text-xs text-slate-600 dark:text-slate-300">
            Dang dong bo...
          </span>
        ) : null}
      </div>

      {period === "custom" ? (
        <DateTimePicker
          className="mt-3"
          value={{ fromDate, toDate }}
          onChange={onDateRangeChange}
        />
      ) : null}
    </div>
  );
}

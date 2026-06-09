import { RefreshCw } from "lucide-react";

import { ComboBox, DateTimePicker, Input } from "src/components/common";
import { Select } from "src/components/core/Select/Select";
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
  { label: "Đang hoạt động", value: "active" },
  { label: "Tạm dừng",       value: "inactive" },
  { label: "Bị khóa",        value: "locked" },
  { label: "Không bị khóa",  value: "unlocked" },
];

const periodOptions = [
  { label: "7 ngày gần đây",       value: "7d" },
  { label: "30 ngày gần đây",      value: "30d" },
  { label: "Khoảng ngày tùy chọn", value: "custom" },
];

const sortByOptions = [
  { label: "Ngày tạo",      value: "createdDate" },
  { label: "Ngày cập nhật", value: "updatedDate" },
  { label: "Đăng nhập cuối", value: "lastLoginDate" },
  { label: "Username",      value: "username" },
];

const sortDirOptions = [
  { label: "Mới nhất", value: "desc" },
  { label: "Cũ nhất",  value: "asc" },
];

export function UserToolbar({
  search, email, username, phone, period, statusFilters, fromDate, toDate,
  sortBy, sortDir, isSyncing,
  onSearchChange, onEmailChange, onUsernameChange, onPhoneChange, onPeriodChange,
  onStatusFiltersChange, onDateRangeChange, onSortByChange, onSortDirChange, onRefresh,
}: UserToolbarProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Theo dõi tài khoản theo email, username, phone và trạng thái hoạt động
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-blue-300/30"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Input
          label="Tìm kiếm chung"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm email, username, phone..."
        />
        <Select
          label="Thời gian"
          value={period === "all" ? "" : period}
          placeholder="Tất cả thời gian"
          options={periodOptions}
          onChange={(e) => onPeriodChange((e.target.value || "all") as UserListPeriod)}
        />
        <ComboBox
          label="Trạng thái"
          value={statusFilters}
          valueCollection={statusOptions}
          placeholder="Tất cả trạng thái"
          onChange={(value) => onStatusFiltersChange(value as UserStatusFilter[])}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Sắp xếp"
            value={sortBy}
            options={sortByOptions}
            onChange={(e) => onSortByChange((e.target.value || "createdDate") as UserListQuery["sortBy"])}
          />
          <Select
            label="Hướng"
            value={sortDir}
            options={sortDirOptions}
            onChange={(e) => onSortDirChange((e.target.value || "desc") as UserListQuery["sortDir"])}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Input
          label="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Lọc riêng theo email"
        />
        <Input
          label="Username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Lọc riêng theo username"
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Lọc riêng theo phone"
        />
        {isSyncing && (
          <span className="self-center text-xs text-slate-600 dark:text-slate-300">
            Đang đồng bộ...
          </span>
        )}
      </div>

      {period === "custom" && (
        <DateTimePicker
          className="mt-3"
          value={{ fromDate, toDate }}
          onChange={onDateRangeChange}
        />
      )}
    </div>
  );
}

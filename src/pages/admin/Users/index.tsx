import { EmptyState } from "src/components/common";

import { UserDetailModal } from "./Component/UserDetailModal";
import { UserPagination } from "./Component/UserPagination";
import { UserSummary } from "./Component/UserSummary";
import { UserTable } from "./Component/UserTable";
import { UserToolbar } from "./Component/UserToolbar";
import { useUserManagement } from "./customHookModule/useUserManagement";

function getUserListErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as {
      response?: {
        status?: number;
        data?: { message?: string; errorCode?: string } | string;
      };
    }).response;
    const body = response?.data;
    const message = typeof body === "string" ? body : body?.message ?? body?.errorCode;

    if (response?.status === 401) return "Phiên đăng nhập hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.";
    if (response?.status === 403) return "Tài khoản hiện tại không có quyền xem danh sách người dùng.";
    if (response?.status === 404) return "Không tìm thấy dữ liệu người dùng. Vui lòng liên hệ quản trị viên.";
    if (response?.status) return `Lỗi ${response.status}: ${message ?? "Không lấy được danh sách người dùng."}`;
  }

  return "Không lấy được danh sách người dùng. Vui lòng kiểm tra kết nối và thử lại.";
}

export default function AdminUsersPage() {
  const userManager = useUserManagement();

  return (
    <div className="space-y-6">
      <UserToolbar
        search={userManager.search}
        email={userManager.email}
        username={userManager.username}
        phone={userManager.phone}
        period={userManager.period}
        statusFilters={userManager.statusFilters}
        fromDate={userManager.fromDate}
        toDate={userManager.toDate}
        sortBy={userManager.sortBy}
        sortDir={userManager.sortDir}
        isSyncing={userManager.isSyncing}
        onSearchChange={userManager.setSearch}
        onEmailChange={userManager.setEmail}
        onUsernameChange={userManager.setUsername}
        onPhoneChange={userManager.setPhone}
        onPeriodChange={userManager.setPeriod}
        onStatusFiltersChange={userManager.setStatusFilters}
        onDateRangeChange={userManager.setDateRange}
        onSortByChange={userManager.setSortBy}
        onSortDirChange={userManager.setSortDir}
        onRefresh={() => void userManager.refetch()}
      />

      <UserSummary
        total={userManager.summary.total}
        currentPage={userManager.summary.currentPage}
        active={userManager.summary.active}
        locked={userManager.summary.locked}
      />

      {userManager.error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {getUserListErrorMessage(userManager.error)}
        </div>
      ) : null}

      {!userManager.error && userManager.users.length === 0 && !userManager.isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có người dùng" description="Chưa có người dùng phù hợp với bộ lọc hiện tại." />
        </div>
      ) : (
        <UserTable
          users={userManager.users}
          loading={userManager.isLoading}
          onView={userManager.openDetail}
        />
      )}

      {!userManager.error ? (
        <UserPagination
          page={userManager.page}
          pageSize={userManager.pageSize}
          data={userManager.pagedUsers}
          onPageChange={userManager.setPage}
          onPageSizeChange={userManager.setPageSize}
        />
      ) : null}

      <UserDetailModal user={userManager.selectedUser} onClose={userManager.closeDetail} />
    </div>
  );
}

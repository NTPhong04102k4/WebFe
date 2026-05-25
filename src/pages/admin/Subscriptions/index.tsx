import { useState } from "react";
import { CreditCard, Search } from "lucide-react";
import { useAdminSubscriptions } from "src/query/premium/usePremiumQueries";
import type { AdminSubscriptionsQuery, SubscriptionStatus } from "src/services/api/functions/premium/premium.types";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  Active: "Đang hoạt động",
  Expired: "Hết hạn",
  Cancelled: "Đã hủy",
  Pending: "Chờ xác nhận",
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Expired: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  Cancelled: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

const PAGE_SIZE = 20;

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
};

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("");

  const query: AdminSubscriptionsQuery = {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
  };

  const { data, isLoading, error } = useAdminSubscriptions(query);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đăng ký Premium</h1>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {totalCount} tổng
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Tìm theo email, tên..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as SubscriptionStatus | ""); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(STATUS_LABELS) as SubscriptionStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">Lỗi tải dữ liệu: {(error as Error).message}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            Không có đăng ký nào phù hợp
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gói</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ngày hết hạn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Còn lại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((sub) => (
                  <tr key={sub.subscriptionID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{sub.fullName || sub.username}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sub.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{sub.planName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sub.tier}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {sub.subscriptionType === "Monthly" ? "Tháng" : "Năm"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[sub.status]}`}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(sub.endDate)}</td>
                    <td className="px-4 py-3">
                      {sub.status === "Active" ? (
                        <span className={`text-xs font-medium ${sub.daysRemaining <= 7 ? "text-red-500" : "text-slate-600 dark:text-slate-300"}`}>
                          {sub.daysRemaining} ngày
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {sub.paymentMethod || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

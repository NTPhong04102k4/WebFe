import { useState } from "react";
import { CreditCard, Filter } from "lucide-react";

import { useAdminSubscriptions } from "src/query/premium/usePremiumQueries";
import type { AdminSubscriptionsQuery } from "src/services/api/functions/premium/premium.types";

const PAGE_SIZE = 20;

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [subscriptionType, setSubscriptionType] = useState<"" | "Monthly" | "Yearly">("");
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");

  const query: AdminSubscriptionsQuery = {
    page,
    pageSize: PAGE_SIZE,
    subscriptionType: subscriptionType || undefined,
    isActive: isActiveFilter === "" ? undefined : isActiveFilter === "true",
  };

  const { data, isLoading, error } = useAdminSubscriptions(query);

  // Backend trả { Data, TotalCount, Page, PageSize }
  const items = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đăng ký Premium</h1>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {totalCount} tổng
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={subscriptionType}
          onChange={(e) => { setSubscriptionType(e.target.value as "" | "Monthly" | "Yearly"); setPage(1); }}
        >
          <option value="">Tất cả loại</option>
          <option value="Monthly">Theo tháng</option>
          <option value="Yearly">Theo năm</option>
        </select>

        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã hết hạn / Hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">
            Lỗi tải dữ liệu: {(error as Error).message}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            Không có đăng ký nào
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bắt đầu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hết hạn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Còn lại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((sub) => (
                  <tr key={sub.userPremiumID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{sub.fullName || sub.username}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sub.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{sub.planName}</div>
                      <div className="text-xs text-slate-400">{sub.planCode}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {sub.subscriptionType === "Monthly" ? "Tháng" : "Năm"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        sub.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {sub.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">
                      {formatCurrency(sub.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(sub.endDate)}</td>
                    <td className="px-4 py-3">
                      {sub.isActive && sub.daysRemaining > 0 ? (
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
            Trang {page} / {totalPages} &nbsp;·&nbsp; {totalCount} đăng ký
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

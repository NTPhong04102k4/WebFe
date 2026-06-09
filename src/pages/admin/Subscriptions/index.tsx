import { useState } from "react";
import { CreditCard, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { useAdminSubscriptions } from "src/query/premium/usePremiumQueries";
import type { AdminSubscription, AdminSubscriptionsQuery } from "src/services/api/functions/premium/premium.types";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import { DataTable } from "src/components/core/Table/DataTable";

const PAGE_SIZE = 20;

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const TYPE_OPTIONS: SelectOption[] = [
  { value: "Monthly", label: "Theo tháng" },
  { value: "Yearly", label: "Theo năm" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã hết hạn / Hủy" },
];

const columns: ColumnDef<AdminSubscription>[] = [
  {
    id: "user",
    header: "Người dùng",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-800 dark:text-slate-100">{row.original.fullName || row.original.username}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{row.original.email}</div>
      </div>
    ),
  },
  {
    id: "plan",
    header: "Gói",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-800 dark:text-slate-100">{row.original.planName}</div>
        <div className="text-xs text-slate-400">{row.original.planCode}</div>
      </div>
    ),
  },
  {
    accessorKey: "subscriptionType",
    header: "Loại",
    cell: ({ getValue }) => (
      <span className="text-slate-600 dark:text-slate-300">
        {getValue<string>() === "Monthly" ? "Tháng" : "Năm"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ getValue }) => {
      const active = getValue<boolean>();
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          active
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}>
          {active ? "Đang hoạt động" : "Không hoạt động"}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ getValue }) => (
      <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Bắt đầu",
    cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300">{formatDate(getValue<string>())}</span>,
  },
  {
    accessorKey: "endDate",
    header: "Hết hạn",
    cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300">{formatDate(getValue<string>())}</span>,
  },
  {
    id: "daysRemaining",
    header: "Còn lại",
    cell: ({ row }) => {
      const { isActive, daysRemaining } = row.original;
      return isActive && daysRemaining > 0 ? (
        <span className={`text-xs font-medium ${daysRemaining <= 7 ? "text-red-500" : "text-slate-600 dark:text-slate-300"}`}>
          {daysRemaining} ngày
        </span>
      ) : (
        <span className="text-xs text-slate-400">-</span>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Thanh toán",
    cell: ({ getValue }) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">{getValue<string | null>() || "-"}</span>
    ),
  },
];

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  const query: AdminSubscriptionsQuery = {
    page,
    pageSize: PAGE_SIZE,
    subscriptionType: subscriptionType || undefined,
    isActive: isActiveFilter === "" ? undefined : isActiveFilter === "true",
  };

  const { data, isLoading, error } = useAdminSubscriptions(query);

  const items = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đăng ký Premium</h1>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {totalCount} tổng
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select
          options={TYPE_OPTIONS}
          placeholder="Tất cả loại"
          value={subscriptionType}
          onChange={(e) => { setSubscriptionType(e.target.value); setPage(1); }}
        />
        <Select
          options={STATUS_OPTIONS}
          placeholder="Tất cả trạng thái"
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
        />
      </div>

      {error ? (
        <div className="p-6 text-center text-sm text-red-500">
          Lỗi tải dữ liệu: {(error as Error).message}
        </div>
      ) : (
        <DataTable
          data={items}
          columns={columns}
          loading={isLoading}
          emptyTitle="Không có đăng ký nào"
        />
      )}

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

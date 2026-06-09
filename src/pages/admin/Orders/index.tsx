import { ShoppingBag, Search, Download, RefreshCw } from "lucide-react";
import { DataTable, Input } from "src/components/common";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";

import { OrderDetailPanel } from "./OrderDetailPanel";
import { useOrdersHandler, monthStart, monthEnd, ORDER_STATUS_LABELS } from "./useOrdersHandler";

const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

const STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả trạng thái" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function AdminOrdersPage() {
  const h = useOrdersHandler();

  const stats = [
    { label: "Tổng đơn hàng", value: h.total, hint: "Tất cả đơn", color: "text-blue-600" },
    {
      label: "Cần xử lý",
      value: h.pendingQ.isLoading || h.processingQ.isLoading ? "…" : h.pendingCount,
      hint: "Chờ xử lý + Đang xử lý (toàn hệ thống)",
      color: h.pendingCount > 0 ? "text-red-600" : "text-slate-700",
    },
    {
      label: "Doanh thu tháng",
      value: h.revenueQ.data ? fmt(h.revenueQ.data.totalRevenue) : "…",
      hint: `${monthStart} – ${monthEnd}`,
      color: "text-green-600",
    },
    {
      label: "Tổng đơn tháng",
      value: h.revenueQ.data?.totalOrders ?? "…",
      hint: "Từ revenue API",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => h.refetch()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${h.isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button
            onClick={h.exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Xuất CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color} dark:opacity-90`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Mã đơn hoặc email..."
            value={h.keyword}
            onChange={(e) => { h.setKeyword(e.target.value); h.setPage(1); }}
            className="pl-8"
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={h.status}
          onChange={(e) => { h.setStatus(e.target.value); h.setPage(1); }}
          className="w-auto"
        />
        <Input
          type="date"
          value={h.fromDate}
          onChange={(e) => { h.setFromDate(e.target.value); h.setPage(1); }}
          className="w-auto"
        />
        <Input
          type="date"
          value={h.toDate}
          onChange={(e) => { h.setToDate(e.target.value); h.setPage(1); }}
          className="w-auto"
        />
        {h.hasFilters && (
          <button
            onClick={h.clearFilters}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <DataTable
        data={h.orders}
        columns={h.columns}
        loading={h.isLoading}
        getRowId={(row) => row.orderNumber}
        emptyTitle="Không có đơn hàng nào"
        emptyDescription="Chưa có đơn hàng phù hợp với bộ lọc."
      />

      {h.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Tổng {h.total} đơn · Trang {h.page}/{h.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={h.page <= 1}
              onClick={() => h.setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Trước
            </button>
            <button
              disabled={h.page >= h.totalPages}
              onClick={() => h.setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <OrderDetailPanel
        orderNumber={h.selectedOrderNumber}
        onClose={() => h.setSelectedOrderNumber(null)}
      />
    </div>
  );
}

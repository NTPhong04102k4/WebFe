import { useState } from "react";
import { ShoppingBag, Search, Download, RefreshCw } from "lucide-react";
import {
  useAdminOrders,
  useRevenue,
} from "src/query/order/useOrderQueries";
import { OrderDetailPanel } from "./OrderDetailPanel";

const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10);

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const PAY_STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Unpaid: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const params = { page, pageSize: PAGE_SIZE, keyword: keyword || undefined, status: status || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined };
  const { data, isLoading, isFetching, refetch } = useAdminOrders(params);
  const revenueQ = useRevenue({ fromDate: monthStart, toDate: monthEnd, groupBy: "Month" });

  const pendingQ = useAdminOrders({ page: 1, pageSize: 1, status: "Pending" });
  const processingQ = useAdminOrders({ page: 1, pageSize: 1, status: "Processing" });

  const orders = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pendingCount = (pendingQ.data?.totalCount ?? 0) + (processingQ.data?.totalCount ?? 0);

  const exportCsv = () => {
    const header = "Mã đơn,Khách hàng,Email,Tổng tiền,Đơn hàng,Thanh toán,Ngày tạo";
    const rows = orders.map((o) =>
      [o.orderNumber, o.customerName, o.customerEmail, o.totalAmount, o.orderStatus, o.paymentStatus, o.paymentDate ?? ""].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng đơn hàng", value: total, hint: "Tất cả đơn", color: "text-blue-600" },
          { label: "Cần xử lý", value: pendingQ.isLoading || processingQ.isLoading ? "…" : pendingCount, hint: "Pending + Processing (toàn hệ thống)", color: pendingCount > 0 ? "text-red-600" : "text-slate-700" },
          { label: "Doanh thu tháng", value: revenueQ.data ? fmt(revenueQ.data.totalRevenue) : "…", hint: `${monthStart} – ${monthEnd}`, color: "text-green-600" },
          { label: "Tổng đơn tháng", value: revenueQ.data?.totalOrders ?? "…", hint: "Từ revenue API", color: "text-purple-600" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color} dark:opacity-90`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Mã đơn hoặc email..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Tất cả trạng thái</option>
          {["Pending", "Processing", "Completed", "Cancelled", "Refunded"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" placeholder="Từ ngày" />
        <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" placeholder="Đến ngày" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3">Đơn hàng</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">Đang tải...</td>
              </tr>
            )}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">Không có đơn hàng nào.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.orderNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{order.customerName ?? "—"}</p>
                    <p className="text-xs text-slate-400">{order.customerEmail ?? "—"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {fmt(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.orderStatus] ?? "bg-slate-100 text-slate-600"}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAY_STATUS_COLORS[order.paymentStatus] ?? "bg-slate-100 text-slate-600"}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {order.paymentDate ? new Date(order.paymentDate).toLocaleDateString("vi-VN") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedOrderNumber(order.orderNumber)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Tổng {total} đơn · Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <OrderDetailPanel
        orderNumber={selectedOrderNumber}
        onClose={() => setSelectedOrderNumber(null)}
      />
    </div>
  );
}

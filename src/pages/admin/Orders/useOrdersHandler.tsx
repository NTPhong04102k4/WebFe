import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAdminOrders, useRevenue } from "src/query/order/useOrderQueries";

const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

const now = new Date();
export const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
export const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ xử lý",
  Processing: "Đang xử lý",
  Completed: "Hoàn thành",
  Cancelled: "Đã huỷ",
  Refunded: "Đã hoàn tiền",
};

const PAY_STATUS_LABELS: Record<string, string> = {
  Paid: "Đã thanh toán",
  Unpaid: "Chưa thanh toán",
  Refunded: "Đã hoàn tiền",
};

const PAY_STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Unpaid: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const PAGE_SIZE = 20;

export function useOrdersHandler() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const params = {
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    status: status || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const { data, isLoading, isFetching, refetch } = useAdminOrders(params);
  const revenueQ = useRevenue({ fromDate: monthStart, toDate: monthEnd, groupBy: "Month" });
  const pendingQ = useAdminOrders({ page: 1, pageSize: 1, status: "Pending" });
  const processingQ = useAdminOrders({ page: 1, pageSize: 1, status: "Processing" });

  const orders = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pendingCount = (pendingQ.data?.totalCount ?? 0) + (processingQ.data?.totalCount ?? 0);

  const hasFilters = Boolean(keyword || status || fromDate || toDate);

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

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

  const columns = useMemo<ColumnDef<(typeof orders)[0]>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Mã đơn",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Khách hàng",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200">{row.original.customerName ?? "—"}</p>
            <p className="text-xs text-slate-400">{row.original.customerEmail ?? "—"}</p>
          </div>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng tiền",
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {fmt(Number(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "orderStatus",
        header: "Đơn hàng",
        cell: ({ getValue }) => {
          const s = String(getValue());
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[s] ?? "bg-slate-100 text-slate-600"}`}>
              {ORDER_STATUS_LABELS[s] ?? s}
            </span>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Thanh toán",
        cell: ({ getValue }) => {
          const s = String(getValue());
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAY_STATUS_COLORS[s] ?? "bg-slate-100 text-slate-600"}`}>
              {PAY_STATUS_LABELS[s] ?? s}
            </span>
          );
        },
      },
      {
        accessorKey: "paymentDate",
        header: "Ngày tạo",
        cell: ({ getValue }) => {
          const v = getValue();
          return (
            <span className="text-xs text-slate-400">
              {v ? new Date(String(v)).toLocaleDateString("vi-VN") : "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedOrderNumber(row.original.orderNumber)}
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Chi tiết
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    page, setPage,
    keyword, setKeyword,
    status, setStatus,
    fromDate, setFromDate,
    toDate, setToDate,
    selectedOrderNumber, setSelectedOrderNumber,
    data, isLoading, isFetching, refetch,
    revenueQ, pendingQ, processingQ,
    orders, total, totalPages, pendingCount,
    hasFilters, clearFilters, exportCsv,
    columns,
  };
}

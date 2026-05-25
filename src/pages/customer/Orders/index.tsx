import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { orderApi } from "@/services/api/functions/orders/order.api";

export default function CustomerOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-orders", 1, 20],
    queryFn: ({ signal }) => orderApi.list({ page: 1, pageSize: 20 }, { signal }),
  });

  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Đơn hàng của tôi</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-6 text-center text-slate-600">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-700">Lỗi: {error.message}</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-slate-600">Chưa có đơn hàng.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {orders.map((order) => (
              <Link key={order.orderID} to={`/orders/${order.orderNumber}`} className="grid gap-3 p-4 hover:bg-slate-50 md:grid-cols-5 md:items-center">
                <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                <div className="text-sm text-slate-600">{order.orderType}</div>
                <div className="text-sm text-slate-600">{order.orderStatus}</div>
                <div className="text-sm text-slate-600">{order.paymentStatus}</div>
                <div className="text-right font-semibold text-blue-700">{formatCurrency(order.totalAmount)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { orderApi } from "@/services/api/functions/orders/order.api";
import { useAuthStore } from "@/stores/authStore";
import type { OrderViewModel } from "@/services/api/functions/orders/order.api";


const PAYMENT_BADGE: Record<string, { className: string; label: string }> = {
  Paid:        { className: "bg-green-100 text-green-700",   label: "Đã thanh toán" },
  PartialPaid: { className: "bg-blue-100 text-blue-700",     label: "Thanh toán một phần" },
  Pending:     { className: "bg-amber-100 text-amber-700",   label: "Chờ thanh toán" },
  Failed:      { className: "bg-red-100 text-red-700",       label: "Thất bại" },
  Refunded:    { className: "bg-purple-100 text-purple-700", label: "Hoàn tiền" },
};

const ORDER_BADGE: Record<string, { className: string; label: string }> = {
  Pending:    { className: "bg-slate-100 text-slate-700",  label: "Đang chờ" },
  Confirmed:  { className: "bg-blue-100 text-blue-700",    label: "Đã xác nhận" },
  Processing: { className: "bg-indigo-100 text-indigo-700", label: "Đang xử lý" },
  Delivered:  { className: "bg-green-100 text-green-700",  label: "Đã giao" },
  Cancelled:  { className: "bg-slate-100 text-slate-500",  label: "Đã hủy" },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản",
  NAPAS_BANK_TRANSFER: "Chuyển khoản (Napas)",
  CASH: "Tiền mặt",
  MIXED: "Kết hợp",
};

function badge(map: Record<string, { className: string; label: string }>, key: string) {
  const { className, label } = map[key] ?? { className: "bg-slate-100 text-slate-600", label: key };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function paymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABEL[method] ?? method;
}

function isPendingPayment(order: OrderViewModel) {
  return (
    (order.paymentStatus === "Pending" || order.paymentStatus === "PartialPaid") &&
    order.orderStatus !== "Cancelled"
  );
}

interface OrderItemPreview {
  key: string;
  name: string;
  imagePath?: string | null;
  quantity: number;
  unitPrice: number;
}

function getOrderItems(order: OrderViewModel): OrderItemPreview[] {
  const cars = (order.cars ?? []).map((car) => ({
    key: `car-${car.carID}`,
    name: car.carName,
    imagePath: car.carImagePath,
    quantity: 1,
    unitPrice: car.unitPrice,
  }));
  const accessories = (order.accessories ?? []).map((acc) => ({
    key: `acc-${acc.accessoryID}`,
    name: acc.accessoryName,
    imagePath: acc.accessoryImagePath,
    quantity: acc.quantity,
    unitPrice: acc.unitPrice,
  }));
  return [...cars, ...accessories];
}

function OrderItemsPreview({ order }: { order: OrderViewModel }) {
  const items = getOrderItems(order);
  if (items.length === 0) return null;

  const visible = items.slice(0, 2);
  const remaining = items.length - visible.length;

  return (
    <div className="mt-2 space-y-1.5">
      {visible.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-sm">
          {item.imagePath ? (
            <img
              src={item.imagePath}
              alt={item.name}
              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-100" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-800">{item.name}</p>
            <p className="text-xs text-slate-500">
              x{item.quantity} · {formatCurrency(item.unitPrice)}
            </p>
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <p className="text-xs text-slate-400">+{remaining} sản phẩm khác</p>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const canLoad = Boolean(accessToken) && user?.role === "Customer";

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-orders", "my-orders", 1, 20],
    queryFn: ({ signal }) => orderApi.myOrders({ page: 1, pageSize: 20 }, { signal }),
    enabled: canLoad,
  });

  const orders = data?.data ?? [];
  const pending = orders.filter(isPendingPayment);
  const rest = orders.filter((o) => !isPendingPayment(o));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Đơn hàng của tôi</h1>

      {!canLoad ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Vui lòng đăng nhập bằng tài khoản Customer để xem đơn hàng.
        </div>
      ) : isLoading ? (
        <div className="mt-6 text-center text-slate-600">Đang tải...</div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Lỗi: {error.message}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Chưa có đơn hàng nào.{" "}
          <Link to="/cars" className="text-blue-600 underline">Mua xe ngay</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">

          {/* ─── Pending — cần thanh toán ─── */}
          {pending.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                Cần thanh toán ({pending.length})
              </h2>
              <div className="overflow-hidden rounded-xl border border-amber-200 bg-white divide-y divide-amber-100">
                {pending.map((order) => (
                  <div
                    key={order.orderID}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                        {badge(ORDER_BADGE, order.orderStatus)}
                        {badge(PAYMENT_BADGE, order.paymentStatus)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {order.orderType} • {paymentMethodLabel(order.paymentMethod)} •{" "}
                        <span className="font-semibold text-blue-700">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                      {order.paymentStatus === "PartialPaid" && (
                        <p className="text-xs text-blue-600">Đã thanh toán một phần — vào đơn để xem tiến trình</p>
                      )}
                      <OrderItemsPreview order={order} />
                    </div>
                    <Link
                      to={`/orders/${order.orderNumber}`}
                      className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      Tiếp tục thanh toán
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Các đơn còn lại ─── */}
          {rest.length > 0 && (
            <section>
              {pending.length > 0 && (
                <h2 className="mb-2 text-sm font-semibold text-slate-500">Lịch sử đơn hàng</h2>
              )}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {rest.map((order) => (
                  <Link
                    key={order.orderID}
                    to={`/orders/${order.orderNumber}`}
                    className="flex flex-col gap-2 p-4 hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                        {badge(ORDER_BADGE, order.orderStatus)}
                        {badge(PAYMENT_BADGE, order.paymentStatus)}
                      </div>
                      <span className="text-sm text-slate-500">
                        {order.orderType} • {paymentMethodLabel(order.paymentMethod)}
                      </span>
                      <OrderItemsPreview order={order} />
                    </div>
                    <span className="shrink-0 font-semibold text-blue-700">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

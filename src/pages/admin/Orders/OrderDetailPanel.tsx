import { X, Package, Car, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useOrderDetail } from "src/query/order/useOrderQueries";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const PRODUCT_ICONS: Record<string, typeof Car> = { Car, Accessory: Package, Insurance: Shield };

type Props = {
  orderNumber: string | null;
  onClose: () => void;
};

export function OrderDetailPanel({ orderNumber, onClose }: Props) {
  const { data: order, isLoading } = useOrderDetail(orderNumber);
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!orderNumber) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {orderNumber}
            </span>
            <button onClick={copyOrderNumber} className="rounded p-1 text-slate-400 hover:text-slate-600">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-slate-400">Đang tải...</div>
          )}
          {!isLoading && order && (
            <>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Thông tin khách hàng
                </h3>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.customerName ?? "—"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerEmail ?? "—"}</p>
                  {order.customerPhone && <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerPhone}</p>}
                  {order.deliveryAddress && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.deliveryAddress}</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trạng thái
                </h3>
                <div className="flex gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[order.orderStatus] ?? "bg-slate-100 text-slate-600"}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : order.paymentStatus === "Refunded"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </section>

              {Array.isArray((order as any).items) && (order as any).items.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sản phẩm
                  </h3>
                  <div className="space-y-2">
                    {((order as any).items as Array<{ productType: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }>).map((item, i) => {
                      const Icon = PRODUCT_ICONS[item.productType] ?? Package;
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{item.productName}</p>
                            <p className="text-xs text-slate-400">x{item.quantity} · {fmt(item.unitPrice)}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{fmt(item.totalPrice)}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{fmt(order.totalAmount)}</span>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            Đóng
          </button>
        </div>
      </aside>
    </>
  );
}

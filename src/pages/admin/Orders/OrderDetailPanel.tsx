import {
  X,
  Package,
  Car,
  Copy,
  Check,
  Mail,
  FileText,
  Download,
  RefreshCw,
  Banknote,
  ClipboardEdit,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import {
  useOrderDetail,
  useSendInvoice,
  useInvoicePdf,
  useCheckPayment,
} from "src/query/order/useOrderQueries";
import { notify } from "src/components/core/Feedback/toast";
import { Loading } from "src/components/core";
import type { CheckPaymentResult } from "src/services/api/functions/orders/order.api";
import { UpdateStatusModal } from "./modals/UpdateStatusModal";
import { RecordCashModal } from "./modals/RecordCashModal";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

type Props = {
  orderNumber: string | null;
  onClose: () => void;
};

export function OrderDetailPanel({ orderNumber, onClose }: Props) {
  const { data: order, isLoading } = useOrderDetail(orderNumber);
  const sendInvoice = useSendInvoice(orderNumber ?? "");
  const invoicePdf = useInvoicePdf(orderNumber ?? "");
  const checkPayment = useCheckPayment(orderNumber ?? "");

  const [copied, setCopied] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [showRecordCash, setShowRecordCash] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckPaymentResult | null>(null);

  const handleSendInvoice = () => {
    sendInvoice.mutate(undefined, {
      onSuccess: () => notify.success("Đã gửi hóa đơn về email khách hàng"),
    });
  };

  const copyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCheckPayment = () => {
    setCheckResult(null);
    checkPayment.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success && res.data) {
          notify.success("Đã thanh toán đầy đủ!");
          setCheckResult(res.data);
        } else if (res.data && (res.data.newTransactions ?? 0) > 0) {
          notify.success(`Ghi nhận ${res.data.newTransactions} giao dịch mới`);
          setCheckResult(res.data);
        } else {
          notify.info(res.message ?? "Chưa tìm thấy giao dịch thanh toán");
          setCheckResult(res.data ?? null);
        }
      },
    });
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
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          )}
          {!isLoading && order && (
            <>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Thông tin khách hàng</h3>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.customerName ?? "—"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerEmail ?? "—"}</p>
                  {order.customerPhone && <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerPhone}</p>}
                  {order.deliveryAddress && <p className="text-sm text-slate-500 dark:text-slate-400">{order.deliveryAddress}</p>}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</h3>
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

              {order.cars?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Xe</h3>
                  <div className="space-y-2">
                    {order.cars.map((car) => (
                      <div key={car.carID} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <Car className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{car.carName}</p>
                          <p className="text-xs text-slate-400">{car.carBrand} · {car.carModel}</p>
                          {car.carVIN && <p className="text-xs text-slate-400">VIN: {car.carVIN}</p>}
                          {car.discountAmount > 0 && <p className="text-xs text-green-600 dark:text-green-400">Giảm: -{fmt(car.discountAmount)}</p>}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100">{fmt(car.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {order.accessories?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Phụ kiện</h3>
                  <div className="space-y-2">
                    {order.accessories.map((acc) => (
                      <div key={acc.accessoryID} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{acc.accessoryName}</p>
                          <p className="text-xs text-slate-400">Mã: {acc.accessoryCode} · x{acc.quantity} · {fmt(acc.unitPrice)}/cái</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100">{fmt(acc.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {order.isInstallment && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Trả góp</h3>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">{order.installmentMonths} tháng</span>
                    </div>
                    {order.downPayment != null && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Tiền đặt cọc</span>
                        <span className="font-medium">{fmt(order.downPayment)}</span>
                      </div>
                    )}
                    {order.monthlyPayment != null && (
                      <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Mỗi tháng trả</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">{fmt(order.monthlyPayment)}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{fmt(order.totalAmount)}</span>
                </div>
              </section>

              {checkResult && (
                <section className={`rounded-lg border p-3 space-y-1 text-sm ${
                  checkResult.remaining === 0
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                    : "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                }`}>
                  <p className={`font-semibold ${checkResult.remaining === 0 ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"}`}>
                    {checkResult.remaining === 0 ? "✓ Đã thanh toán đầy đủ" : "ℹ Chưa thanh toán đủ"}
                  </p>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Đã thanh toán</span>
                    <span className="font-medium">{fmt(checkResult.totalPaid)}</span>
                  </div>
                  {checkResult.remaining > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Còn lại</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{fmt(checkResult.remaining)}</span>
                    </div>
                  )}
                  {(checkResult.newTransactions ?? 0) > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Giao dịch mới: {checkResult.newTransactions}</p>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-700 space-y-2">
          {order?.paymentStatus === "Paid" && (
            <div className="flex gap-2">
              <button
                onClick={handleSendInvoice}
                disabled={sendInvoice.isPending || invoicePdf.isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-400"
              >
                <Mail className="h-4 w-4" />
                {sendInvoice.isPending ? "Đang gửi..." : "Gửi email"}
              </button>
              <button
                onClick={() => invoicePdf.mutate({ action: "open" })}
                disabled={invoicePdf.isPending || sendInvoice.isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
              >
                <FileText className="h-4 w-4" />
                {invoicePdf.isPending ? "Đang tải..." : "Xem PDF"}
              </button>
              <button
                onClick={() => invoicePdf.mutate({ action: "download" })}
                disabled={invoicePdf.isPending || sendInvoice.isPending}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                title="Tải PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}

          {order && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpdateStatus(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <ClipboardEdit className="h-4 w-4" />
                Cập nhật trạng thái
              </button>
              {order.paymentStatus !== "Paid" && (
                <button
                  onClick={() => setShowRecordCash(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <Banknote className="h-4 w-4" />
                  Thu tiền mặt
                </button>
              )}
            </div>
          )}

          {order && order.paymentStatus !== "Paid" && (
            <button
              onClick={handleCheckPayment}
              disabled={checkPayment.isPending}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${checkPayment.isPending ? "animate-spin" : ""}`} />
              {checkPayment.isPending ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            Đóng
          </button>
        </div>
      </aside>

      {order && (
        <UpdateStatusModal
          open={showUpdateStatus}
          orderId={order.orderID}
          currentStatus={order.orderStatus}
          onClose={() => setShowUpdateStatus(false)}
        />
      )}

      {order && orderNumber && (
        <RecordCashModal
          open={showRecordCash}
          orderNumber={orderNumber}
          totalAmount={order.totalAmount}
          onClose={() => setShowRecordCash(false)}
        />
      )}
    </>
  );
}

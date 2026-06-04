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
  useUpdateOrderStatus,
  useRecordCash,
  useCheckPayment,
} from "src/query/order/useOrderQueries";
import { notify } from "src/components/core/Feedback/toast";
import type { CheckPaymentResult } from "src/services/api/functions/orders/order.api";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];


type Props = {
  orderNumber: string | null;
  onClose: () => void;
};

/* ─────────────────────────────────────────────
   Modal A: Cập nhật trạng thái
───────────────────────────────────────────── */
function UpdateStatusModal({
  orderId,
  currentStatus,
  onClose,
}: {
  orderId: string | number;
  currentStatus: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(
    ORDER_STATUSES.includes(currentStatus as OrderStatus)
      ? (currentStatus as OrderStatus)
      : "Pending"
  );
  const [notes, setNotes] = useState("");
  const updateStatus = useUpdateOrderStatus();

  const handleSubmit = () => {
    updateStatus.mutate(
      { id: orderId, status, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          notify.success("Cập nhật trạng thái thành công");
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          Cập nhật trạng thái đơn hàng
        </h2>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Trạng thái
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "Pending"
                ? "Chờ xử lý"
                : s === "Processing"
                ? "Đang xử lý"
                : s === "Completed"
                ? "Hoàn thành"
                : "Đã huỷ"}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Nhập ghi chú cho lần cập nhật này..."
          className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateStatus.isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateStatus.isPending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Modal B: Ghi nhận thanh toán tiền mặt
───────────────────────────────────────────── */
function RecordCashModal({
  orderNumber,
  totalAmount,
  onClose,
}: {
  orderNumber: string;
  totalAmount: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(totalAmount > 0 ? String(totalAmount) : "");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const recordCash = useRecordCash(orderNumber);

  const handleSubmit = () => {
    const parsedAmount = Number(amount.replace(/\D/g, ""));
    if (!parsedAmount || parsedAmount <= 0) {
      notify.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    recordCash.mutate(
      {
        amount: parsedAmount,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          notify.success("Ghi nhận tiền mặt thành công");
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          Thu tiền mặt
        </h2>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Số tiền (VNĐ)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          placeholder="Nhập số tiền..."
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
        />

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Số phiếu thu (tuỳ chọn)
        </label>
        <input
          type="text"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          placeholder="Mã phiếu thu / biên lai..."
          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
        />

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Ghi chú người thu (tuỳ chọn)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Tên nhân viên thu tiền, ghi chú thêm..."
          className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={recordCash.isPending}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={recordCash.isPending}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {recordCash.isPending ? "Đang ghi..." : "Xác nhận thu"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Panel chính
───────────────────────────────────────────── */
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
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-slate-400">Đang tải...</div>
          )}
          {!isLoading && order && (
            <>
              {/* Thông tin khách hàng */}
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

              {/* Trạng thái */}
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

              {/* Sản phẩm — xe */}
              {order.cars?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Xe
                  </h3>
                  <div className="space-y-2">
                    {order.cars.map((car) => (
                      <div key={car.carID} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <Car className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{car.carName}</p>
                          <p className="text-xs text-slate-400">{car.carBrand} · {car.carModel}</p>
                          {car.carVIN && <p className="text-xs text-slate-400">VIN: {car.carVIN}</p>}
                          {car.discountAmount > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400">Giảm: -{fmt(car.discountAmount)}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100">{fmt(car.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sản phẩm — phụ kiện */}
              {order.accessories?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phụ kiện
                  </h3>
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

              {/* Thông tin trả góp */}
              {order.isInstallment && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Trả góp
                  </h3>
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

              {/* Tổng tiền */}
              <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{fmt(order.totalAmount)}</span>
                </div>
              </section>

              {/* Kết quả đối soát thanh toán */}
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Giao dịch mới: {checkResult.newTransactions}
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-700 space-y-2">
          {/* Nút hóa đơn (chỉ khi đã thanh toán) */}
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

          {/* Nhóm nút quản lý (luôn hiện khi có order) */}
          {order && (
            <div className="flex gap-2">
              {/* A — Cập nhật trạng thái */}
              <button
                onClick={() => setShowUpdateStatus(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <ClipboardEdit className="h-4 w-4" />
                Cập nhật trạng thái
              </button>

              {/* B — Thu tiền mặt (chỉ khi chưa thanh toán đủ) */}
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

          {/* C — Kiểm tra thanh toán online */}
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

          {/* Đóng */}
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            Đóng
          </button>
        </div>
      </aside>

      {/* Modal A */}
      {showUpdateStatus && order && (
        <UpdateStatusModal
          orderId={order.orderID}
          currentStatus={order.orderStatus}
          onClose={() => setShowUpdateStatus(false)}
        />
      )}

      {/* Modal B */}
      {showRecordCash && orderNumber && order && (
        <RecordCashModal
          orderNumber={orderNumber}
          totalAmount={order.totalAmount}
          onClose={() => setShowRecordCash(false)}
        />
      )}
    </>
  );
}

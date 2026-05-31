import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { orderApi, type RecordCashInput, type CheckPaymentApiResponse, type PaymentStatus } from "@/services/api/functions/orders/order.api";
import { useAuthStore } from "@/stores/authStore";
import { useCheckPayment, useRecordCash, useInvoicePdf } from "@/query/order/useOrderQueries";
import { useQuery } from "@tanstack/react-query";
import { orderKeys } from "@/query/order/keys";

const STAFF_ROLES = ["Admin", "SuperAdmin", "Staff", "Sales", "SalesManager"] as const;

function isHttpStatus(error: unknown, status: number) {
  return (error as { response?: { status?: number } })?.response?.status === status;
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { className: string; label: string }> = {
    Paid:        { className: "bg-green-50 text-green-700",   label: "Đã thanh toán" },
    PartialPaid: { className: "bg-blue-50 text-blue-700",     label: "Thanh toán một phần" },
    Pending:     { className: "bg-amber-50 text-amber-700",   label: "Đang chờ thanh toán" },
    Failed:      { className: "bg-red-50 text-red-700",       label: "Thanh toán thất bại" },
    Refunded:    { className: "bg-purple-50 text-purple-700", label: "Đã hoàn tiền" },
  };
  const { className, label } = config[status] ?? config.Pending;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

function PartialProgressBar({ totalPaid, orderTotal }: { totalPaid: number; orderTotal: number }) {
  const pct = orderTotal > 0 ? Math.min(100, Math.round((totalPaid / orderTotal) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Đã thanh toán</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-blue-700">{formatCurrency(totalPaid)}</span>
        <span className="text-slate-500">/ {formatCurrency(orderTotal)}</span>
      </div>
      <p className="text-sm font-medium text-amber-700">
        Còn thiếu: {formatCurrency(Math.max(0, orderTotal - totalPaid))}
      </p>
    </div>
  );
}

function CashModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (data: RecordCashInput) => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount.replace(/\D/g, ""));
    if (!parsed || parsed <= 0) return;
    onSubmit({ amount: parsed, receiptNumber: receiptNumber.trim() || undefined, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-slate-900">Ghi tiền mặt</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Số tiền <span className="text-red-500">*</span></span>
            <input
              required
              type="text"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="VD: 2000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Số phiếu thu</span>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="VD: PT-2026-001"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ghi chú</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Khách trả tiền mặt tại showroom..."
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isPending ? "Đang ghi..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const { orderNumber = "" } = useParams();
  const [pollExpired, setPollExpired] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckPaymentApiResponse | null>(null);
  const [showCashModal, setShowCashModal] = useState(false);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const canViewOrder = Boolean(accessToken) && user?.role === "Customer";
  const canRecordCash = user?.role != null && (STAFF_ROLES as readonly string[]).includes(user.role);
  const pollUntil = useMemo(() => Date.now() + 5 * 60 * 1000, [orderNumber]);

  const detail = useQuery({
    queryKey: orderNumber ? orderKeys.detail(orderNumber) : ["orders", "detail", "none"],
    enabled: Boolean(orderNumber) && canViewOrder,
    queryFn: ({ signal }) => orderApi.detail(orderNumber, { signal }),
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus;
      if (status === "Paid" || status === "Failed") return false;
      if (Date.now() >= pollUntil) {
        setPollExpired(true);
        return false;
      }
      return 5_000;
    },
  });

  const payment = useQuery({
    queryKey: orderNumber ? orderKeys.paymentInfo(orderNumber) : ["orders", "payment-info", "none"],
    enabled: Boolean(orderNumber) && canViewOrder && detail.data?.paymentStatus !== "Paid",
    queryFn: ({ signal }) => orderApi.paymentInfo(orderNumber, { signal }),
    retry: false,
  });

  const checkPayment = useCheckPayment(orderNumber);
  const recordCash = useRecordCash(orderNumber);
  const invoicePdf = useInvoicePdf(orderNumber);

  const order = detail.data;
  const pay = payment.data;
  const isPending = order?.paymentStatus === "Pending" || order?.paymentStatus === "PartialPaid";

  useEffect(() => {
    setPollExpired(false);
    setCheckResult(null);
  }, [orderNumber]);

  const handleCheck = () => {
    checkPayment.mutate(undefined, {
      onSuccess: (result) => setCheckResult(result),
    });
  };

  const handleRecordCash = (data: RecordCashInput) => {
    recordCash.mutate(data, { onSuccess: () => setShowCashModal(false) });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/orders" className="text-sm font-medium text-blue-700 hover:underline">
        ← Quay lại đơn hàng
      </Link>

      {!canViewOrder ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Vui lòng đăng nhập bằng tài khoản Customer để xem đơn hàng.
        </div>
      ) : detail.isLoading ? (
        <div className="mt-6 text-center text-slate-600">Đang tải...</div>
      ) : detail.error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {detail.error.message}
        </div>
      ) : order ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* Thông tin đơn hàng */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Trạng thái:</span> <b>{order.orderStatus}</b></div>
              <div><span className="text-slate-500">Loại đơn:</span> <b>{order.orderType}</b></div>
              <div><span className="text-slate-500">Phương thức:</span> <b>{order.paymentMethod}</b></div>
              {order.paymentDate && (
                <div><span className="text-slate-500">Ngày TT:</span> <b>{new Date(order.paymentDate).toLocaleString("vi-VN")}</b></div>
              )}
            </div>
            <div className="mt-5 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Thuế</span>
                <span>{formatCurrency(order.taxAmount ?? 0)}</span>
              </div>
              {order.discountAmount ? (
                <div className="mt-2 flex justify-between text-sm">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex justify-between text-lg font-bold text-blue-700">
                <span>Tổng đơn</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Panel thanh toán */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-slate-900">Thanh toán</h2>

            {/* Paid */}
            {order.paymentStatus === "Paid" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-700">✓ Đơn hàng đã được thanh toán đủ.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={invoicePdf.isPending}
                    onClick={() => invoicePdf.mutate({ action: "open" })}
                    className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {invoicePdf.isPending ? "Đang tải..." : "Xem hóa đơn PDF"}
                  </button>
                  <button
                    type="button"
                    disabled={invoicePdf.isPending}
                    onClick={() => invoicePdf.mutate({ action: "download" })}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {invoicePdf.isPending ? "Đang tải..." : "Tải hóa đơn PDF"}
                  </button>
                </div>
              </div>
            )}

            {/* PartialPaid — progress bar từ checkResult hoặc order total */}
            {order.paymentStatus === "PartialPaid" && (
              <PartialProgressBar
                totalPaid={checkResult?.data?.totalPaid ?? 0}
                orderTotal={checkResult?.data?.orderTotal ?? order.totalAmount}
              />
            )}

            {/* QR cho Pending */}
            {order.paymentStatus === "Pending" && (
              payment.isLoading ? (
                <p className="text-sm text-slate-600">Đang tải QR...</p>
              ) : pay ? (
                <div className="space-y-3">
                  {pay.qrImageUrl && (
                    <img
                      className="mx-auto h-44 w-44 rounded-lg border border-slate-100 object-contain"
                      src={pay.qrImageUrl}
                      alt="QR thanh toán"
                    />
                  )}
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngân hàng</span>
                      <span className="font-medium">{pay.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số TK</span>
                      <span className="font-medium">{pay.bankAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số tiền</span>
                      <span className="font-semibold text-blue-700">
                        {pay.amount != null ? formatCurrency(pay.amount) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-500 shrink-0">Nội dung CK</span>
                      <span className="font-mono font-bold text-blue-700 select-all text-right">
                        {pay.transferContent}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">⚠ Nhập đúng nội dung để hệ thống tự xác nhận.</p>
                </div>
              ) : isHttpStatus(payment.error, 404) ? (
                <p className="text-sm text-slate-600">Không còn thông tin QR.</p>
              ) : null
            )}

            {/* Kết quả check-payment */}
            {checkResult && (
              <div className={`rounded-lg p-3 text-sm ${
                checkResult.success
                  ? "bg-green-50 text-green-700"
                  : checkResult.errorCode === "PartialPayment"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {checkResult.success
                  ? "✓ Xác nhận thanh toán thành công!"
                  : checkResult.errorCode === "PartialPayment"
                  ? checkResult.message
                  : checkResult.errorCode === "NotFound"
                  ? "Chưa tìm thấy giao dịch khớp. Vui lòng thử lại sau 1-2 phút."
                  : checkResult.errorCode === "ExternalError"
                  ? "Lỗi kết nối SePay. Vui lòng thử lại sau."
                  : checkResult.message ?? "Vui lòng thử lại."}
              </div>
            )}

            {/* Nút đối soát online — Pending hoặc PartialPaid */}
            {isPending && (
              <button
                type="button"
                disabled={checkPayment.isPending}
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                onClick={handleCheck}
              >
                {checkPayment.isPending
                  ? "Đang kiểm tra..."
                  : pollExpired
                  ? "Kiểm tra lại giao dịch"
                  : "Tôi đã chuyển khoản — Kiểm tra"}
              </button>
            )}

            {/* Nút ghi tiền mặt — Staff/Admin only */}
            {isPending && canRecordCash && (
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setShowCashModal(true)}
              >
                Ghi tiền mặt
              </button>
            )}
          </div>
        </div>
      ) : null}

      {showCashModal && (
        <CashModal
          onClose={() => setShowCashModal(false)}
          onSubmit={handleRecordCash}
          isPending={recordCash.isPending}
        />
      )}
    </div>
  );
}

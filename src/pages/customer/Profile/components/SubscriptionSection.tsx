import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "@/components/core/Feedback/toast";
import {
  useMySubscription,
  usePremiumMutations,
} from "@/query/premium/usePremiumQueries";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { SubscribeResponseData } from "@/services/api/functions/premium/premium.types";
import { getPremiumErrorMessage } from "@/services/api/functions/premium/premium.types";

export function SubscriptionSection() {
  const navigate = useNavigate();
  const subscription = useMySubscription();
  const { cancel, cancelPending, renew, activateSubscription } = usePremiumMutations();
  const [renewQrData, setRenewQrData] = useState<SubscribeResponseData | null>(null);

  const sub = subscription.data;
  const isActive    = sub?.isActive === true;
  const isPending   = sub != null && !sub.isActive && !!sub.paymentReference;
  const isCancelled = isActive && !!sub?.deprecatedAt;
  const isExpired   = isActive && (sub?.daysRemaining ?? 1) <= 0;
  const isNearExpiry = isActive && !isExpired && (sub?.daysRemaining ?? 99) <= 7;

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => notify.success("Đã hủy gia hạn tự động."),
    });
  };

  const handleRenew = () => {
    renew.mutate(undefined, {
      onSuccess: (data) => setRenewQrData(data),
    });
  };

  const handleActivatePending = () => {
    if (!sub?.paymentReference) return;
    activateSubscription.mutate(
      { paymentReference: sub.paymentReference },
      {
        onSuccess: () => notify.success("Kích hoạt gói thành công!"),
      }
    );
  };

  const handleActivateRenew = () => {
    if (!renewQrData?.subscription.paymentReference) return;
    activateSubscription.mutate(
      { paymentReference: renewQrData.subscription.paymentReference },
      {
        onSuccess: () => {
          notify.success("Gia hạn thành công!");
          setRenewQrData(null);
        },
      }
    );
  };

  if (subscription.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-16 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Gói thành viên</h2>
        <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <p className="text-sm font-medium text-slate-700">Bạn chưa đăng ký gói Premium nào.</p>
          <ul className="mt-3 space-y-1.5">
            {[
              "Xem không giới hạn xe đăng bán",
              "Hỗ trợ ưu tiên 24/7",
              "Trợ lý AI tư vấn mua xe",
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-4 w-4 shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/premium")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Khám phá các gói →
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = isExpired
    ? { label: "Đã hết hạn", cls: "bg-red-100 text-red-600" }
    : isCancelled
    ? { label: "Đã hủy gia hạn", cls: "bg-slate-100 text-slate-500" }
    : isActive
    ? { label: "Đang hoạt động", cls: "bg-green-100 text-green-700" }
    : { label: "Chờ thanh toán", cls: "bg-yellow-100 text-yellow-700" };

  const cardGradient = isExpired
    ? "bg-gradient-to-r from-slate-500 to-slate-700"
    : "bg-gradient-to-r from-blue-600 to-indigo-600";

  const endDate = new Date(sub.endDate).toLocaleDateString("vi-VN");

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Gói thành viên</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge.cls}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Near-expiry warning */}
        {isNearExpiry && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Gói sắp hết hạn trong <strong>{sub.daysRemaining} ngày</strong>
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                Gia hạn sớm để không gián đoạn dịch vụ.
              </p>
            </div>
          </div>
        )}

        {/* Expired warning */}
        {isExpired && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                Gói đã hết hạn vào <strong>{endDate}</strong>
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                Gia hạn ngay để tiếp tục sử dụng các tính năng Premium.
              </p>
            </div>
          </div>
        )}

        <div className={`mt-4 rounded-xl ${cardGradient} p-5 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-75">
                {sub.subscriptionType === "Monthly" ? "Hàng tháng" : "Hàng năm"}
              </p>
              <p className="mt-1 text-xl font-bold">{sub.planName}</p>
            </div>
            <svg className="h-8 w-8 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/15 px-3 py-2">
              <p className="text-xs opacity-75">Hết hạn</p>
              <p className="mt-0.5 text-sm font-semibold">{endDate}</p>
            </div>
            <div className="rounded-lg bg-white/15 px-3 py-2">
              <p className="text-xs opacity-75">Còn lại</p>
              <p className="mt-0.5 text-sm font-semibold">
                {isExpired ? "Đã hết hạn" : `${sub.daysRemaining} ngày`}
              </p>
            </div>
          </div>
        </div>

        {/* PENDING — hiện mã chuyển khoản */}
        {isPending && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-700">
              Nội dung chuyển khoản:{" "}
              <strong className="font-mono">{sub.paymentReference}</strong>
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Số tiền: {formatCurrency(sub.price)}
            </p>
          </div>
        )}

        {isCancelled && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Gói đã hủy — còn hiệu lực đến{" "}
            <strong>{endDate}</strong>. Bạn có thể gia hạn bất kỳ lúc nào.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {isActive && (isExpired || isNearExpiry) && (
            <button
              onClick={handleRenew}
              disabled={renew.isPending}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50 ${
                isExpired
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {renew.isPending ? "Đang xử lý..." : isExpired ? "Gia hạn ngay" : "Gia hạn gói"}
            </button>
          )}
          {isPending && (
            <>
              <button
                onClick={handleActivatePending}
                disabled={activateSubscription.isPending}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {activateSubscription.isPending ? "Đang kiểm tra..." : "Tôi đã chuyển khoản"}
              </button>
              <button
                onClick={() => cancelPending.mutate(undefined, {
                  onSuccess: () => notify.success("Đã hủy đơn chờ thanh toán."),
                })}
                disabled={cancelPending.isPending}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {cancelPending.isPending ? "..." : "Hủy đơn chờ"}
              </button>
            </>
          )}
          {/* Ẩn nút Hủy khi đã hết hạn hoặc đã cancelled */}
          {isActive && !isExpired && !isCancelled && sub.autoRenew && (
            <button
              onClick={handleCancel}
              disabled={cancel.isPending}
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {cancel.isPending ? "Đang hủy..." : "Hủy gia hạn"}
            </button>
          )}
          {!isExpired && (
            <button
              onClick={() => navigate("/premium")}
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Đổi gói
            </button>
          )}
        </div>

        {isActive && !isExpired && sub.autoRenew && (
          <p className="mt-3 text-xs text-slate-400">
            Gia hạn tự động vào {endDate}. Bạn có thể hủy bất kỳ lúc nào.
          </p>
        )}
      </div>

      {/* Modal QR gia hạn */}
      {renewQrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Thanh toán gia hạn</h2>
              <button
                onClick={() => setRenewQrData(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex justify-center">
                <img
                  src={renewQrData.payment.qrImageUrl}
                  alt="QR gia hạn"
                  className="h-52 w-52 rounded-xl border object-contain shadow-sm"
                />
              </div>
              <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Ngân hàng</span>
                  <span className="font-semibold text-slate-900">{renewQrData.payment.bankName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Số tài khoản</span>
                  <span className="font-semibold text-slate-900">{renewQrData.payment.bankAccount}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Số tiền</span>
                  <span className="font-bold text-blue-700">{formatCurrency(renewQrData.payment.amount)}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Nội dung CK</span>
                  <span className="font-semibold text-slate-900 text-right break-all">
                    {renewQrData.payment.transferContent}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500">
                QR hết hạn lúc {new Date(renewQrData.payment.expiredAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button
                onClick={() => setRenewQrData(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Để sau
              </button>
              <button
                onClick={handleActivateRenew}
                disabled={activateSubscription.isPending}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {activateSubscription.isPending ? "Đang kiểm tra..." : "Tôi đã chuyển khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

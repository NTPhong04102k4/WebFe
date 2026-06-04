import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { useMySubscriptionHistory } from "@/query/premium/usePremiumQueries";
import { usePremiumMutations } from "@/query/premium/usePremiumQueries";
import { notify } from "@/components/core/Feedback/toast";
import { getPremiumErrorMessage } from "@/services/api/functions/Premium/premium.types";
import type {
  SubscriptionHistoryItem,
  SubscribeResponseData,
} from "@/services/api/functions/Premium/premium.types";
import QRPaymentPanel from "@/pages/customer/Premium/components/QRPaymentPanel";

// ─── Badges ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  Active:  { className: "bg-green-100 text-green-700",  label: "Đang hoạt động" },
  Pending: { className: "bg-amber-100 text-amber-700",  label: "Chờ thanh toán" },
  Expired: { className: "bg-slate-100 text-slate-500",  label: "Đã hết hạn" },
};

function StatusBadge({ status }: { status: string }) {
  const { className, label } = STATUS_BADGE[status] ?? {
    className: "bg-slate-100 text-slate-600",
    label: status,
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function SubscriptionRow({
  item,
  onOpenQr,
  isLoadingQr,
}: {
  item: SubscriptionHistoryItem;
  onOpenQr: (item: SubscriptionHistoryItem) => void;
  isLoadingQr: boolean;
}) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const isPending = item.status === "Pending";

  return (
    <div
      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
        isPending
          ? "cursor-pointer hover:bg-amber-50 transition-colors"
          : ""
      }`}
      onClick={isPending ? () => onOpenQr(item) : undefined}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">{item.planName}</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {item.subscriptionType === "Yearly" ? "Hàng năm" : "Hàng tháng"}
          </span>
          <StatusBadge status={item.status} />
          {isPending && (
            <span className="text-xs text-amber-600 font-medium animate-pulse">
              — Nhấn để thanh toán
            </span>
          )}
        </div>
        <div className="text-sm text-slate-500">
          {fmt(item.startDate)} → {fmt(item.endDate)}
        </div>
        <div className="text-xs text-slate-400">
          Đăng ký: {fmt(item.createdDate)}
          {item.paymentMethod && (
            <> · {item.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : item.paymentMethod}</>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <div className="font-semibold text-blue-700">{formatCurrency(item.price)}</div>
          <div className="text-xs text-slate-400">
            {item.subscriptionType === "Yearly" ? "/năm" : "/tháng"}
          </div>
        </div>
        {isPending && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQr(item);
            }}
            disabled={isLoadingQr}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {isLoadingQr ? "Đang tải..." : "Xem QR"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────

function QrModal({
  qrData,
  isActivating,
  onActivate,
  onCancel,
  isCancelling,
  onClose,
}: {
  qrData: SubscribeResponseData;
  isActivating: boolean;
  onActivate: () => void;
  onCancel: () => void;
  isCancelling: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tiếp tục thanh toán</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Chuyển khoản và nhấn xác nhận để kích hoạt gói
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <QRPaymentPanel
          data={qrData}
          onActivate={onActivate}
          isActivating={isActivating}
          onClose={() => {
            onCancel();
          }}
          closeLabel={isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
          activateLabel="Tôi đã chuyển khoản"
          activatingLabel="Đang kiểm tra..."
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function PremiumHistoryPage() {
  const [page, setPage] = useState(1);
  const [qrData, setQrData] = useState<SubscribeResponseData | null>(null);

  const { data, isLoading, error } = useMySubscriptionHistory({ page, pageSize: PAGE_SIZE });
  const { getPendingQr, activateSubscription, cancelPending } = usePremiumMutations();

  const items = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpenQr = (_item: SubscriptionHistoryItem) => {
    getPendingQr.mutate(undefined, {
      onSuccess: (res) => setQrData(res),
      onError: (err) => notify.error(getPremiumErrorMessage(err)),
    });
  };

  const handleActivate = () => {
    if (!qrData?.subscription.paymentReference) return;
    activateSubscription.mutate(
      { paymentReference: qrData.subscription.paymentReference },
      {
        onSuccess: (result) => {
          notify.success("Kích hoạt gói Premium thành công!");
          if (result?.data?.hasPendingOrders) {
            notify.info("Bạn có đơn hàng đang chờ — giới hạn đơn đã được áp dụng.");
          }
          setQrData(null);
        },
        onError: (err) => {
          const code = (err as { response?: { data?: { errorCode?: string } } })
            ?.response?.data?.errorCode;
          if (code === "NotFound") {
            notify.info("Chưa tìm thấy giao dịch. Vui lòng chờ vài giây và thử lại.");
          } else {
            notify.error(getPremiumErrorMessage(err));
          }
        },
      }
    );
  };

  const handleCancel = () => {
    cancelPending.mutate(undefined, {
      onSuccess: () => {
        notify.success("Đã hủy đăng ký đang chờ thanh toán.");
        setQrData(null);
      },
      onError: (err) => notify.error(getPremiumErrorMessage(err)),
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử đăng ký Premium</h1>
          {total > 0 && (
            <p className="mt-1 text-sm text-slate-500">{total} lần đăng ký</p>
          )}
        </div>
        <Link
          to="/premium"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Xem gói hiện tại
        </Link>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="text-center text-slate-500">Đang tải...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không thể tải lịch sử đăng ký.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Bạn chưa có lịch sử đăng ký Premium nào.{" "}
          <Link to="/premium" className="text-blue-600 underline">
            Khám phá các gói ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {items.map((item) => (
              <SubscriptionRow
                key={item.userPremiumID}
                item={item}
                onOpenQr={handleOpenQr}
                isLoadingQr={getPendingQr.isPending}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Trước
              </button>
              <span className="text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* QR Modal */}
      {qrData && (
        <QrModal
          qrData={qrData}
          isActivating={activateSubscription.isPending}
          onActivate={handleActivate}
          onCancel={handleCancel}
          isCancelling={cancelPending.isPending}
          onClose={() => setQrData(null)}
        />
      )}
    </div>
  );
}

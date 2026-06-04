import { useEffect, useState } from "react";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { SubscribeResponseData } from "@/services/api/functions/premium/premium.types";

interface Props {
  data: SubscribeResponseData;
  /** Nút chính (activate). isPending → hiển thị loading label */
  onActivate: () => void;
  isActivating: boolean;
  /** Nút phụ (đóng / để sau) */
  onClose: () => void;
  closeLabel?: string;
  activateLabel?: string;
  activatingLabel?: string;
}

function useCountdown(expiredAt: string | undefined) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiredAt) return;
    const update = () => {
      const diff = new Date(expiredAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Đã hết hạn"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [expiredAt]);

  return timeLeft;
}

export default function QRPaymentPanel({
  data,
  onActivate,
  isActivating,
  onClose,
  closeLabel = "Để sau",
  activateLabel = "Tôi đã chuyển khoản",
  activatingLabel = "Đang kiểm tra...",
}: Props) {
  const timeLeft = useCountdown(data.payment.expiredAt);
  const isExpired = timeLeft === "Đã hết hạn";

  return (
    <>
      <div className="space-y-4 px-6 py-5">
        {/* QR code */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={data.payment.qrImageUrl}
              alt="QR chuyển khoản"
              className={`h-52 w-52 rounded-xl border object-contain shadow-sm transition-opacity ${
                isExpired ? "opacity-30" : ""
              }`}
            />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <span className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                  QR đã hết hạn
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-slate-500">Ngân hàng</span>
            <span className="font-semibold text-slate-900">{data.payment.bankName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-slate-500">Số tài khoản</span>
            <span className="font-semibold text-slate-900">{data.payment.bankAccount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 text-slate-500">Số tiền</span>
            <span className="font-bold text-blue-700">{formatCurrency(data.payment.amount)}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="shrink-0 text-slate-500">Nội dung CK</span>
            <span className="break-all text-right font-semibold text-slate-900">
              {data.payment.transferContent}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <p className="text-center text-xs text-slate-500">
          Hết hạn sau:{" "}
          <span
            className={
              isExpired
                ? "font-semibold text-red-500"
                : "font-medium text-amber-600"
            }
          >
            {timeLeft}
          </span>
        </p>

        {!isExpired && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-center text-xs font-medium text-amber-700">
              Sau khi chuyển khoản, nhấn "{activateLabel}" để kích hoạt gói.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-center text-xs font-medium text-red-700">
              Phiên thanh toán đã hết hạn. Vui lòng đóng và tạo lại đăng ký.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t px-6 py-4">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {closeLabel}
        </button>
        <button
          onClick={onActivate}
          disabled={isActivating || isExpired}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isActivating ? activatingLabel : activateLabel}
        </button>
      </div>
    </>
  );
}

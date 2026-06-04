import { useState } from "react";
import { notify } from "@/components/core/Feedback/toast";
import { usePremiumMutations } from "@/query/premium/usePremiumQueries";
import type {
  PremiumPlan,
  SubscribeResponseData,
  SubscriptionType,
} from "@/services/api/functions/premium/premium.types";
import { getPremiumErrorMessage } from "@/services/api/functions/premium/premium.types";
import { formatCurrency } from "@/common/utils/formatCurrency";
import QRPaymentPanel from "./QRPaymentPanel";

interface Props {
  plan: PremiumPlan;
  onClose: () => void;
  initialSubscriptionType?: SubscriptionType;
}

function extractErrorCode(err: unknown): string | undefined {
  return (err as { response?: { data?: { errorCode?: string } } })
    ?.response?.data?.errorCode;
}

export default function SubscribeModal({
  plan,
  onClose,
  initialSubscriptionType = "Monthly",
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(initialSubscriptionType);
  const [autoRenew, setAutoRenew] = useState(true);
  const [qrData, setQrData] = useState<SubscribeResponseData | null>(null);

  const { subscribe, activateSubscription } = usePremiumMutations();

  const price = subscriptionType === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const yearlySaving =
    plan.monthlyPrice > 0
      ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
      : 0;

  const handleSubscribe = () => {
    subscribe.mutate(
      { planID: plan.planID, subscriptionType, autoRenew },
      {
        onSuccess: (data) => {
          setQrData(data);
          setStep(2);
        },
      }
    );
  };

  const handleActivate = () => {
    if (!qrData?.subscription.paymentReference) return;
    activateSubscription.mutate(
      { paymentReference: qrData.subscription.paymentReference },
      {
        onSuccess: (result) => {
          notify.success(`Kích hoạt ${plan.planName} thành công!`);
          if (result?.data?.hasPendingOrders) {
            notify.info(
              "Bạn có đơn hàng đang chờ thanh toán — giới hạn đơn mới đã được áp dụng."
            );
          }
          onClose();
        },
        onError: (err) => {
          const code = extractErrorCode(err);
          if (code === "PaymentExpired") {
            // QR hết hạn → reset về step 1 để tạo QR mới
            setStep(1);
            setQrData(null);
            notify.info("Phiên thanh toán đã hết hạn. Vui lòng tạo lại.");
          } else if (code === "NotFound") {
            // SePay chưa nhận giao dịch — retryable, không phải lỗi vĩnh viễn
            notify.info("Chưa tìm thấy giao dịch. Vui lòng chờ vài giây và thử lại.");
          } else {
            notify.error(getPremiumErrorMessage(err));
          }
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {step === 1 ? `Đăng ký ${plan.planName}` : "Thanh toán chuyển khoản"}
            </h2>
            {step === 2 && (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500">Bước 1 / 2 — Chuyển khoản</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Bước 1 — Form chọn gói */}
        {step === 1 && (
          <>
            <div className="space-y-5 px-6 py-5">
              {/* Chu kỳ */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Chu kỳ thanh toán</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["Monthly", "Yearly"] as SubscriptionType[]).map((type) => {
                    const isSelected = subscriptionType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSubscriptionType(type)}
                        className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {type === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-blue-700">
                          {formatCurrency(
                            type === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice
                          )}
                          <span className="font-normal text-slate-500">
                            /{type === "Monthly" ? "tháng" : "năm"}
                          </span>
                        </div>
                        {type === "Yearly" && yearlySaving > 0 && (
                          <span className="absolute right-2 top-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                            -{yearlySaving}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tự gia hạn */}
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                  <div
                    className={`h-5 w-9 rounded-full transition-colors ${
                      autoRenew ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        autoRenew ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-slate-700">Tự động gia hạn</span>
              </label>

              {/* Tổng tiền */}
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tổng thanh toán</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(price)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Thanh toán qua chuyển khoản ngân hàng (QR SePay)
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubscribe}
                disabled={subscribe.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {subscribe.isPending ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </div>
          </>
        )}

        {/* Bước 2 — QR + Activate */}
        {step === 2 && qrData && (
          <QRPaymentPanel
            data={qrData}
            onActivate={handleActivate}
            isActivating={activateSubscription.isPending}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

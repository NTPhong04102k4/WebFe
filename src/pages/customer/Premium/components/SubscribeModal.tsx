import { useState } from "react";
import toast from "react-hot-toast";
import { usePremiumMutations } from "@/query/premium/usePremiumQueries";
import type { PaymentMethod, PremiumPlan, SubscriptionType } from "@/services/api/functions/premium/premium.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

interface Props {
  plan: PremiumPlan;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "BankTransfer", label: "Chuyển khoản ngân hàng" },
  { value: "MoMo", label: "Ví MoMo" },
  { value: "ZaloPay", label: "ZaloPay" },
  { value: "CreditCard", label: "Thẻ tín dụng / ghi nợ" },
  { value: "Cash", label: "Tiền mặt" },
];

export default function SubscribeModal({ plan, onClose }: Props) {
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("Monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BankTransfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);

  const { subscribe } = usePremiumMutations();

  const price = subscriptionType === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const saving = subscriptionType === "Yearly"
    ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
    : 0;

  const handleSubmit = () => {
    subscribe.mutate(
      {
        planID: plan.planID,
        subscriptionType,
        paymentMethod,
        paymentReference: paymentReference.trim() || null,
        autoRenew,
      },
      {
        onSuccess: () => {
          toast.success(`Đăng ký ${plan.planName} thành công!`);
          onClose();
        },
        onError: () => toast.error("Đăng ký thất bại. Vui lòng thử lại."),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Đăng ký {plan.planName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Loại đăng ký */}
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
                    <div className="font-semibold text-sm text-slate-900">
                      {type === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-blue-700">
                      {formatCurrency(type === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice)}
                      <span className="font-normal text-slate-500">
                        /{type === "Monthly" ? "tháng" : "năm"}
                      </span>
                    </div>
                    {type === "Yearly" && saving > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                        -{saving}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phương thức thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mã tham chiếu */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mã giao dịch / tham chiếu
              <span className="ml-1 text-slate-400">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Nhập mã giao dịch nếu đã thanh toán"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
              {subscriptionType === "Monthly"
                ? "Thanh toán mỗi tháng, có thể hủy bất kỳ lúc nào."
                : `Thanh toán một lần cho 12 tháng${saving > 0 ? `, tiết kiệm ${saving}% so với gói tháng.` : "."}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={subscribe.isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {subscribe.isPending ? "Đang xử lý..." : "Xác nhận đăng ký"}
          </button>
        </div>
      </div>
    </div>
  );
}

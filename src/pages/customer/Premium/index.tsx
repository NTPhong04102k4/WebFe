import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePremiumPlans, useMySubscription, usePremiumMutations } from "@/query/premium/usePremiumQueries";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { PremiumPlan, SubscriptionType } from "@/services/api/functions/premium/premium.types";
import SubscribeModal from "./components/SubscribeModal";

const TIER_STYLES: Record<string, { gradient: string; badge: string; ring: string }> = {
  Silver: {
    gradient: "from-slate-400 to-slate-600",
    badge: "bg-slate-100 text-slate-700",
    ring: "ring-slate-300",
  },
  Gold: {
    gradient: "from-yellow-400 to-amber-600",
    badge: "bg-yellow-50 text-yellow-800",
    ring: "ring-yellow-400",
  },
  Platinum: {
    gradient: "from-blue-500 to-indigo-700",
    badge: "bg-blue-50 text-blue-800",
    ring: "ring-blue-500",
  },
};

function getStyle(tier: string) {
  return TIER_STYLES[tier] ?? TIER_STYLES["Silver"];
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan,
  onSubscribe,
}: {
  plan: PremiumPlan;
  billingCycle: SubscriptionType;
  isCurrentPlan: boolean;
  onSubscribe: (plan: PremiumPlan) => void;
}) {
  const style = getStyle(plan.tier);
  const price = billingCycle === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const isPopular = plan.tier === "Gold";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg ${
        isCurrentPlan ? `ring-2 ${style.ring}` : "border-slate-200"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-white shadow">
            PHỔ BIẾN NHẤT
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`-mx-6 -mt-6 mb-5 rounded-t-2xl bg-gradient-to-br px-6 py-5 text-white ${style.gradient}`}>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
          {plan.tier}
        </span>
        <h3 className="mt-2 text-xl font-bold">{plan.planName}</h3>
        {plan.description && (
          <p className="mt-1 text-sm opacity-80">{plan.description}</p>
        )}
      </div>

      {/* Giá */}
      <div className="mb-5">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(price)}
          </span>
          <span className="mb-1 text-sm text-slate-500">
            /{billingCycle === "Monthly" ? "tháng" : "năm"}
          </span>
        </div>
        {billingCycle === "Yearly" && (
          <p className="mt-1 text-xs text-slate-500">
            ≈ {formatCurrency(Math.round(plan.yearlyPrice / 12))}/tháng
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
        {plan.aiChatAccess && (
          <li className="flex items-start gap-2 text-sm text-slate-700">
            <CheckIcon />
            <span>Trợ lý AI tư vấn xe</span>
          </li>
        )}
        {plan.prioritySupport && (
          <li className="flex items-start gap-2 text-sm text-slate-700">
            <CheckIcon />
            <span>Hỗ trợ ưu tiên 24/7</span>
          </li>
        )}
        {plan.maxListings != null && (
          <li className="flex items-start gap-2 text-sm text-slate-700">
            <CheckIcon />
            <span>Đăng tối đa {plan.maxListings} xe</span>
          </li>
        )}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="rounded-xl bg-green-50 py-2.5 text-center text-sm font-semibold text-green-700">
          Gói hiện tại của bạn
        </div>
      ) : (
        <button
          onClick={() => onSubscribe(plan)}
          className={`w-full rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 ${style.gradient}`}
        >
          Đăng ký ngay
        </button>
      )}
    </div>
  );
}

export default function PremiumPlansPage() {
  const [billingCycle, setBillingCycle] = useState<SubscriptionType>("Monthly");
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);

  const navigate = useNavigate();
  const plans = usePremiumPlans();
  const mySubscription = useMySubscription();
  const { renew, cancel } = usePremiumMutations();

  const activePlans = (plans.data ?? []).filter((p) => p.isActive);
  const currentSub = mySubscription.data?.subscription;

  const handleSubscribe = (plan: PremiumPlan) => {
    setSelectedPlan(plan);
  };

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => toast.success("Đã hủy gia hạn tự động."),
      onError: () => toast.error("Hủy thất bại. Vui lòng thử lại."),
    });
  };

  const handleRenew = () => {
    renew.mutate(undefined, {
      onSuccess: () => toast.success("Gia hạn thành công!"),
      onError: () => toast.error("Gia hạn thất bại. Vui lòng thử lại."),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          Thành viên Premium
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
          Nâng cấp trải nghiệm của bạn
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
          Mở khóa tính năng độc quyền, ưu tiên hỗ trợ và nhiều quyền lợi hấp dẫn cùng các gói Premium.
        </p>
      </div>

      {/* Toggle billing */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1">
          {(["Monthly", "Yearly"] as SubscriptionType[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`relative rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                billingCycle === cycle
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {cycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
              {cycle === "Yearly" && (
                <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                  Tiết kiệm hơn
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current subscription banner */}
      {currentSub && currentSub.status === "Active" && (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-blue-900">
                Bạn đang sử dụng <span className="text-blue-700">{currentSub.planName}</span>
              </p>
              <p className="mt-0.5 text-sm text-blue-700">
                Còn lại {currentSub.daysRemaining} ngày •{" "}
                {new Date(currentSub.endDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRenew}
                disabled={renew.isPending}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {renew.isPending ? "..." : "Gia hạn"}
              </button>
              {currentSub.autoRenew && (
                <button
                  onClick={handleCancel}
                  disabled={cancel.isPending}
                  className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {cancel.isPending ? "..." : "Hủy gia hạn"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans grid */}
      {plans.isLoading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.planID}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={currentSub?.planID === plan.planID && currentSub.status === "Active"}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      )}

      {!plans.isLoading && activePlans.length === 0 && (
        <p className="mt-16 text-center text-slate-500">
          Hiện chưa có gói Premium nào. Vui lòng quay lại sau.
        </p>
      )}

      {/* FAQ nhanh */}
      <div className="mt-16 rounded-2xl bg-slate-50 p-8">
        <h2 className="text-xl font-bold text-slate-900">Câu hỏi thường gặp</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              q: "Tôi có thể hủy gói bất kỳ lúc nào không?",
              a: "Có, bạn có thể hủy tự động gia hạn bất kỳ lúc nào. Gói sẽ còn hiệu lực đến hết kỳ đã thanh toán.",
            },
            {
              q: "Gói năm có ưu đãi gì so với gói tháng?",
              a: "Gói năm giúp bạn tiết kiệm đáng kể so với trả hàng tháng, tương đương dùng 1–2 tháng miễn phí.",
            },
            {
              q: "Làm thế nào để nâng cấp lên gói cao hơn?",
              a: "Chỉ cần chọn gói muốn nâng cấp và đăng ký. Hệ thống sẽ tự động điều chỉnh.",
            },
            {
              q: "Tôi có thể xem lịch sử giao dịch ở đâu?",
              a: "Vào trang Hồ sơ cá nhân, mục 'Gói thành viên' để xem chi tiết đăng ký.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-medium text-slate-900">{q}</p>
              <p className="mt-1 text-sm text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedPlan && (
        <SubscribeModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}

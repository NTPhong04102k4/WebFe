import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, X, Zap } from "lucide-react";
import { usePremiumPlans } from "@/query/premium/usePremiumQueries";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { PremiumPlan } from "@/services/api/functions/premium/premium.types";
import SubscribeModal from "./SubscribeModal";

interface Props {
  featureTitle: string;
  featureDescription: string;
  onClose: () => void;
}

const TIER_COLORS: Record<string, string> = {
  Silver: "from-slate-400 to-slate-600",
  Gold: "from-yellow-400 to-amber-500",
  Platinum: "from-blue-500 to-indigo-700",
};

export default function PremiumGateModal({ featureTitle, featureDescription, onClose }: Props) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const plans = usePremiumPlans();
  const activePlans = (plans.data ?? []).filter((p) => p.isActive);

  if (selectedPlan) {
    return (
      <SubscribeModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{featureTitle}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{featureDescription}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plans */}
        <div className="px-6 py-5">
          <p className="mb-4 text-sm font-medium text-slate-700">Chọn gói để mở khóa:</p>
          {plans.isLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {activePlans.map((plan) => {
                const gradient = TIER_COLORS[plan.tier ?? "Silver"] ?? TIER_COLORS.Silver;
                return (
                  <button
                    key={plan.planID}
                    onClick={() => setSelectedPlan(plan)}
                    className="flex flex-col rounded-xl border-2 border-transparent bg-slate-50 p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2.5 py-0.5 text-xs font-semibold text-white ${gradient}`}>
                      <Zap className="h-3 w-3" />
                      {plan.tier}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{plan.planName}</p>
                    <p className="mt-1 text-base font-bold text-blue-700">
                      {formatCurrency(plan.monthlyPrice)}
                      <span className="text-xs font-normal text-slate-500">/tháng</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Để sau
          </button>
          <button
            onClick={() => { onClose(); navigate("/premium"); }}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Xem tất cả gói
          </button>
        </div>
      </div>
    </div>
  );
}

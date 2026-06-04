import { CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
import type { PremiumPlan } from "src/services/api/functions/premium/premium.types";
import { parsePlanFeatures } from "src/services/api/functions/premium/premium.types";


const TIER_STYLES: Record<string, { badge: string; border: string; dot: string }> = {
  Bronze:   { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",   border: "border-amber-300 dark:border-amber-700",   dot: "bg-amber-400" },
  Silver:   { badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",       border: "border-slate-300 dark:border-slate-600",    dot: "bg-slate-400" },
  Gold:     { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700",  dot: "bg-yellow-400" },
  Platinum: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",        border: "border-blue-300 dark:border-blue-700",      dot: "bg-blue-500" },
};

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

type Props = {
  plan: PremiumPlan;
  onEdit: (plan: PremiumPlan) => void;
  onDelete: (plan: PremiumPlan) => void;
  isDeleting: boolean;
};

export function PlanCard({ plan, onEdit, onDelete, isDeleting }: Props) {
  const tierKey = plan.tier ?? "Silver";
  const tier = TIER_STYLES[tierKey] ?? TIER_STYLES.Silver;
  const features = parsePlanFeatures(plan.features);


  return (
    <div className={`group relative rounded-xl border-2 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${tier.border}`}>
      {/* Tier dot */}
      <div className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${tier.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start gap-2">
          <div className="flex-1">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">{plan.planName}</h2>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tier.badge}`}>
                {tierKey}
              </span>

              {plan.isActive && !plan.deprecatedAt && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle className="h-3 w-3" /> Active
                </span>
              )}
              {plan.deprecatedAt && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  <XCircle className="h-3 w-3" /> Đang deprecate
                </span>
              )}
              {!plan.isActive && !plan.deprecatedAt && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <XCircle className="h-3 w-3" /> Đã tắt
                </span>
              )}
            </div>
          </div>
        </div>

        {plan.description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {plan.description}
          </p>
        )}

        {/* Prices */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <div className="text-xs text-slate-400">Tháng</div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">{fmt(plan.monthlyPrice)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
            <div className="text-xs text-slate-400">Năm</div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">{fmt(plan.yearlyPrice)}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
          {plan.maxListings != null && (
            <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-300">
              Max {plan.maxListings} tin
            </span>
          )}
          {plan.aiChatAccess && (
            <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              AI Chat
            </span>
          )}
          {plan.prioritySupport && (
            <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Priority
            </span>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="mb-4 space-y-1">
            {features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                {f}
              </li>
            ))}
            {features.length > 3 && (
              <li className="text-xs text-slate-400">+{features.length - 3} tính năng khác</li>
            )}
          </ul>
        )}

      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700">
        <button
          onClick={() => onEdit(plan)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Edit className="h-3.5 w-3.5" /> Sửa
        </button>
        <button
          onClick={() => onDelete(plan)}
          disabled={isDeleting || !!plan.deprecatedAt}
          title={plan.deprecatedAt ? "Gói đang chờ dọn sạch sau khi hết hạn" : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3.5 w-3.5" /> Xóa
        </button>
      </div>
    </div>
  );
}

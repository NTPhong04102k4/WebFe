import { Activity, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import type { PremiumPlan } from "src/services/api/functions/premium/premium.types";

type Props = { plans: PremiumPlan[] };

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export function PlanStats({ plans }: Props) {
  const activePlans = plans.filter((p) => p.isActive);
  const cheapest = plans.length
    ? Math.min(...plans.map((p) => p.monthlyPrice))
    : 0;
  const priciest = plans.length
    ? Math.max(...plans.map((p) => p.monthlyPrice))
    : 0;

  const stats = [
    {
      label: "Gói đang hoạt động",
      value: activePlans.length,
      sub: `/ ${plans.length} tổng`,
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Tổng số gói",
      value: plans.length,
      sub: "bao gồm inactive",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Giá thấp nhất",
      value: plans.length ? fmt(cheapest) : "—",
      sub: "/tháng",
      icon: TrendingDown,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Giá cao nhất",
      value: plans.length ? fmt(priciest) : "—",
      sub: "/tháng",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">{s.label}</p>
              <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

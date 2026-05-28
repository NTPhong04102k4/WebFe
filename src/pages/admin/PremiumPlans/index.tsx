import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { usePremiumPlans, useAdminPremiumMutations } from "src/query/premium/usePremiumQueries";
import type { PremiumPlan } from "src/services/api/functions/premium/premium.types";
import { PremiumPlanFormModal } from "./PremiumPlanFormModal";
import { PlanCard } from "./PlanCard";
import { PlanStats } from "./PlanStats";

const MOCK_SUBSCRIPTION_DATA = [
  { month: "T1", count: 12 },
  { month: "T2", count: 18 },
  { month: "T3", count: 14 },
  { month: "T4", count: 22 },
  { month: "T5", count: 30 },
  { month: "T6", count: 27 },
];

const MOCK_TOP_PLANS = [
  { name: "Gold Plan", tier: "Gold", count: 42 },
  { name: "Silver Plan", tier: "Silver", count: 35 },
  { name: "Platinum Plan", tier: "Platinum", count: 18 },
  { name: "Bronze Plan", tier: "Bronze", count: 12 },
];

function SubscriptionOverview() {
  const maxCount = Math.max(...MOCK_SUBSCRIPTION_DATA.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line chart (bars) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Đăng ký theo tháng (6 tháng gần nhất)
          </h3>
          <div className="flex h-40 items-end gap-2">
            {MOCK_SUBSCRIPTION_DATA.map((d) => {
              const pct = (d.count / maxCount) * 100;
              return (
                <div key={d.month} className="group relative flex flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-xs font-medium text-slate-500">{d.count}</span>
                  <div
                    className="w-full rounded-t-md bg-yellow-400 transition-all group-hover:bg-yellow-500"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="mt-1 text-xs text-slate-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top plans */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Gói đăng ký nhiều nhất
          </h3>
          <div className="space-y-3">
            {MOCK_TOP_PLANS.map((p, i) => {
              const maxCnt = Math.max(...MOCK_TOP_PLANS.map((x) => x.count));
              const pct = (p.count / maxCnt) * 100;
              const tierColors: Record<string, string> = {
                Bronze: "bg-amber-400",
                Silver: "bg-slate-400",
                Gold: "bg-yellow-400",
                Platinum: "bg-blue-500",
              };
              return (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      {p.name}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{p.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${tierColors[p.tier] ?? "bg-blue-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400">* Dữ liệu mô phỏng — cần endpoint /premium-plans/admin/subscriptions</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPremiumPlansPage() {
  const { data: plans = [], isLoading } = usePremiumPlans();
  const { deletePlan } = useAdminPremiumMutations();
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"plans" | "stats">("plans");

  const openCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan: PremiumPlan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleDelete = (plan: PremiumPlan) => {
    if (!window.confirm(`Xóa gói "${plan.planName}"?`)) return;
    deletePlan.mutate(plan.planID, {
      onSuccess: () => notify.success("Đã xóa gói Premium"),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý gói Premium</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm gói mới
        </button>
      </div>

      {/* Stats cards */}
      {!isLoading && <PlanStats plans={plans} />}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit dark:border-slate-700 dark:bg-slate-800">
        {(["plans", "stats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t === "plans" ? "Gói Premium" : "Thống kê & Subscriptions"}
          </button>
        ))}
      </div>

      {/* Tab 1: Plans grid */}
      {tab === "plans" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">Đang tải...</div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">Chưa có gói Premium nào. Hãy tạo gói đầu tiên.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.planID}
                  plan={plan}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deletePlan.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Stats & subscriptions */}
      {tab === "stats" && <SubscriptionOverview />}

      <PremiumPlanFormModal
        open={modalOpen}
        editingPlan={editingPlan}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

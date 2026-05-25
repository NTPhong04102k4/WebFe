import { useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { usePremiumPlans, useAdminPremiumMutations } from "src/query/premium/usePremiumQueries";
import type { PremiumPlan } from "src/services/api/functions/premium/premium.types";
import { PremiumPlanFormModal } from "./PremiumPlanFormModal";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function AdminPremiumPlansPage() {
  const { data: plans = [], isLoading } = usePremiumPlans();
  const { deletePlan } = useAdminPremiumMutations();
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan: PremiumPlan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleDelete = (plan: PremiumPlan) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa gói "${plan.planName}" không?`)) return;
    deletePlan.mutate(plan.planID, {
      onSuccess: () => notify.success("Đã xóa gói Premium"),
      onError: () => notify.error("Có lỗi xảy ra khi xóa gói"),
    });
  };

  return (
    <div className="space-y-6">
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">Đang tải...</div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">Chưa có gói Premium nào. Hãy tạo gói đầu tiên.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.planID}
              className="relative rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">{plan.planName}</h2>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {plan.tier}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    plan.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {plan.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {plan.isActive ? "Đang hoạt động" : "Tắt"}
                </span>
              </div>

              {plan.description && (
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
              )}

              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Giá tháng</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(plan.monthlyPrice)}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Giá năm</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(plan.yearlyPrice)}</div>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                {plan.maxListings != null && (
                  <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    Tối đa {plan.maxListings} tin đăng
                  </span>
                )}
                {plan.aiChatAccess && (
                  <span className="rounded bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    Truy cập AI
                  </span>
                )}
                {plan.prioritySupport && (
                  <span className="rounded bg-orange-100 px-2 py-1 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    Hỗ trợ ưu tiên
                  </span>
                )}
              </div>

              {plan.features.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <button
                  onClick={() => openEdit(plan)}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-400 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  disabled={deletePlan.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-red-400 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PremiumPlanFormModal
        open={modalOpen}
        editingPlan={editingPlan}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

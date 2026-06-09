import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { EmptyState, Loading, Modal } from "src/components/core";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import {
  usePremiumPlans,
  useAdminPremiumMutations,
} from "src/query/premium/usePremiumQueries";
import type { DeletePlanResult, PremiumPlan } from "src/services/api/functions/premium/premium.types";
import { PremiumPlanFormModal } from "./PremiumPlanFormModal";
import { PlanCard } from "./PlanCard";
import { PlanStats } from "./PlanStats";
import { SubscriptionOverview } from "./SubscriptionOverview";

type IsActiveFilter = "all" | "active" | "inactive";

const PLAN_FILTER_OPTIONS: SelectOption[] = [
  { value: "all",      label: "Tất cả"         },
  { value: "active",   label: "Đang hoạt động" },
  { value: "inactive", label: "Đã tắt"         },
];

function toPlanQueryParam(f: IsActiveFilter): { isActive?: boolean } {
  if (f === "active")   return { isActive: true };
  if (f === "inactive") return { isActive: false };
  return {};
}

export default function AdminPremiumPlansPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<IsActiveFilter>("all");
  const { data: plans = [], isLoading }      = usePremiumPlans(toPlanQueryParam(isActiveFilter));
  const { deletePlan }                       = useAdminPremiumMutations();
  const [editingPlan, setEditingPlan]        = useState<PremiumPlan | null>(null);
  const [modalOpen, setModalOpen]            = useState(false);
  const [tab, setTab]                        = useState<"plans" | "stats">("plans");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<PremiumPlan | null>(null);
  const [deprecateDialog, setDeprecateDialog] = useState<DeletePlanResult | null>(null);

  const openCreate = () => { setEditingPlan(null); setModalOpen(true); };
  const openEdit   = (plan: PremiumPlan) => { setEditingPlan(plan); setModalOpen(true); };

  const confirmDelete = () => {
    if (!deleteConfirmItem) return;
    deletePlan.mutate(deleteConfirmItem.planID, {
      onSuccess: (res) => {
        const result = res?.data;
        setDeleteConfirmItem(null);
        if (!result) return;
        if (!result.isDeprecated) {
          notify.success("Đã xóa gói Premium");
        } else {
          setDeprecateDialog(result);
        }
      },
    });
  };

  return (
    <div className="space-y-5">
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

      {!isLoading && <PlanStats plans={plans} />}

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

      {tab === "plans" && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 dark:text-slate-400">Trạng thái:</label>
            <Select
              options={PLAN_FILTER_OPTIONS}
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value as IsActiveFilter)}
              className="w-auto"
            />
            {isActiveFilter !== "all" && (
              <button onClick={() => setIsActiveFilter("all")} className="text-xs text-slate-400 hover:text-slate-600">
                Xóa lọc
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
              <EmptyState
                title="Chưa có gói Premium"
                description="Hãy tạo gói đầu tiên."
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.planID}
                  plan={plan}
                  onEdit={openEdit}
                  onDelete={(plan) => setDeleteConfirmItem(plan)}
                  isDeleting={deletePlan.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "stats" && <SubscriptionOverview />}

      <PremiumPlanFormModal
        open={modalOpen}
        editingPlan={editingPlan}
        onClose={() => setModalOpen(false)}
      />

      <Modal
        open={!!deleteConfirmItem}
        title="Xác nhận xóa gói"
        onClose={() => setDeleteConfirmItem(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteConfirmItem(null)}
              disabled={deletePlan.isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              disabled={deletePlan.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deletePlan.isPending ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Xóa gói <span className="font-semibold text-slate-800 dark:text-slate-100">"{deleteConfirmItem?.planName}"</span>?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      <Modal
        open={!!deprecateDialog}
        title="Gói đã tắt nhưng chưa xóa hoàn toàn"
        onClose={() => setDeprecateDialog(null)}
        size="sm"
        footer={
          <button
            onClick={() => setDeprecateDialog(null)}
            className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Đã hiểu
          </button>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Còn <strong>{deprecateDialog?.activeSubscriberCount}</strong> người dùng đang sử dụng.
          {deprecateDialog?.lastExpiryDate && (
            <> Gói sẽ được dọn sạch sau{" "}
              <strong>{new Date(deprecateDialog.lastExpiryDate).toLocaleDateString("vi-VN")}</strong>.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Gói đã được đánh dấu "Đang deprecate" — không nhận đăng ký mới.
        </p>
      </Modal>
    </div>
  );
}

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import {
  usePremiumPlans,
  useAdminPremiumMutations,
  useAdminSubscriptions,
} from "src/query/premium/usePremiumQueries";
import type { AdminSubscription, DeletePlanResult, PremiumPlan } from "src/services/api/functions/premium/premium.types";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { PremiumPlanFormModal } from "./PremiumPlanFormModal";
import { PlanCard } from "./PlanCard";
import { PlanStats } from "./PlanStats";

// ── Subscription Overview (Tab Stats) ────────────────────────────────────────

type StatusTab = "all" | "active" | "pending" | "expired";

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all",     label: "Tất cả"  },
  { value: "active",  label: "Active"  },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  Active:  { label: "Active",  cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"  },
  Pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  Expired: { label: "Expired", cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"    },
};

function tabToIsActive(tab: StatusTab): boolean | undefined {
  if (tab === "active")  return true;
  if (tab === "pending" || tab === "expired") return false;
  return undefined;
}

function applyStatusFilter(items: AdminSubscription[], tab: StatusTab): AdminSubscription[] {
  if (tab === "active")  return items.filter((x) => x.status === "Active");
  if (tab === "pending") return items.filter((x) => x.status === "Pending");
  if (tab === "expired") return items.filter((x) => x.status === "Expired");
  return items;
}

const PAGE_SIZE = 20;

function SubscriptionOverview() {
  const [statusTab, setStatusTab]           = useState<StatusTab>("all");
  const [planId, setPlanId]                 = useState<number | undefined>(undefined);
  const [subscriptionType, setSubType]      = useState<string | undefined>(undefined);
  const [page, setPage]                     = useState(1);

  // Plans cho dropdown filter
  const { data: allPlans = [] } = usePremiumPlans();

  // Query tổng hợp (không filter) — dùng để đếm summary cards
  const summaryQuery = useAdminSubscriptions({ pageSize: 999 });
  const summaryItems = summaryQuery.data?.data ?? [];
  const counts = {
    total:   summaryQuery.data?.totalCount ?? 0,
    active:  summaryItems.filter((x) => x.status === "Active").length,
    pending: summaryItems.filter((x) => x.status === "Pending").length,
    expired: summaryItems.filter((x) => x.status === "Expired").length,
  };

  // Query cho bảng (có filter + phân trang)
  const tableQuery = useAdminSubscriptions({
    page,
    pageSize: PAGE_SIZE,
    planId,
    subscriptionType,
    isActive: tabToIsActive(statusTab),
  });
  const rawItems  = tableQuery.data?.data ?? [];
  const tableItems = applyStatusFilter(rawItems, statusTab);
  const totalCount = tableQuery.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const changeTab = (tab: StatusTab) => { setStatusTab(tab); setPage(1); };
  const changePlan = (v: string)      => { setPlanId(v ? Number(v) : undefined); setPage(1); };
  const changeType = (v: string)      => { setSubType(v || undefined); setPage(1); };

  return (
    <div className="space-y-5">

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng",    value: counts.total,   cls: "text-slate-700 dark:text-slate-100" },
          { label: "Active",  value: counts.active,  cls: "text-green-600 dark:text-green-400"  },
          { label: "Pending", value: counts.pending, cls: "text-yellow-600 dark:text-yellow-400" },
          { label: "Expired", value: counts.expired, cls: "text-slate-400"                      },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.cls}`}>
              {summaryQuery.isLoading ? "—" : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tab filter + dropdowns ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => changeTab(t.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusTab === t.value
                  ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select
            value={planId ?? ""}
            onChange={(e) => changePlan(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Tất cả gói</option>
            {allPlans.map((p) => (
              <option key={p.planID} value={p.planID}>{p.planName}</option>
            ))}
          </select>
          <select
            value={subscriptionType ?? ""}
            onChange={(e) => changeType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Tất cả loại</option>
            <option value="Monthly">Hàng tháng</option>
            <option value="Yearly">Hàng năm</option>
          </select>
        </div>
      </div>

      {/* ── Bảng dữ liệu ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {tableQuery.isLoading ? (
          <div className="flex items-center justify-center py-14 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : tableItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
            <Sparkles className="h-8 w-8 opacity-30" />
            <p className="text-sm">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Gói</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Còn lại</th>
                  <th className="px-4 py-3 text-right">Giá</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tableItems.map((item) => {
                  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE["Expired"];
                  return (
                    <tr
                      key={item.userPremiumID}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Người dùng */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {item.username}
                        </p>
                        {item.email && (
                          <p className="text-xs text-slate-400">{item.email}</p>
                        )}
                      </td>

                      {/* Gói */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {item.planName}
                        </p>
                        <span className="text-xs text-slate-400">{item.planCode}</span>
                      </td>

                      {/* Loại */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.subscriptionType === "Monthly"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {item.subscriptionType === "Monthly" ? "Tháng" : "Năm"}
                        </span>
                      </td>

                      {/* Thời gian */}
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        <p>{new Date(item.startDate).toLocaleDateString("vi-VN")}</p>
                        <p className="mt-0.5">
                          → {new Date(item.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </td>

                      {/* Còn lại */}
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {item.daysRemaining > 0 ? `${item.daysRemaining} ngày` : "—"}
                      </td>

                      {/* Giá */}
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                        {formatCurrency(item.price)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages} · {totalCount} bản ghi
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plan management tab ───────────────────────────────────────────────────────

type IsActiveFilter = "all" | "active" | "inactive";

const PLAN_FILTER_OPTIONS: { value: IsActiveFilter; label: string }[] = [
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
  const [isActiveFilter, setIsActiveFilter]   = useState<IsActiveFilter>("all");
  const { data: plans = [], isLoading }        = usePremiumPlans(toPlanQueryParam(isActiveFilter));
  const { deletePlan }                         = useAdminPremiumMutations();
  const [editingPlan, setEditingPlan]          = useState<PremiumPlan | null>(null);
  const [modalOpen, setModalOpen]              = useState(false);
  const [tab, setTab]                          = useState<"plans" | "stats">("plans");
  const [deprecateDialog, setDeprecateDialog]  = useState<DeletePlanResult | null>(null);

  const openCreate = () => { setEditingPlan(null); setModalOpen(true); };
  const openEdit   = (plan: PremiumPlan) => { setEditingPlan(plan); setModalOpen(true); };

  const handleDelete = (plan: PremiumPlan) => {
    if (!window.confirm(`Xóa gói "${plan.planName}"?`)) return;
    deletePlan.mutate(plan.planID, {
      onSuccess: (res) => {
        const result = res?.data;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Quản lý gói Premium
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm gói mới
        </button>
      </div>

      {/* Stats cards (plan summary) */}
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
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 dark:text-slate-400">Trạng thái:</label>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value as IsActiveFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {PLAN_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {isActiveFilter !== "all" && (
              <button
                onClick={() => setIsActiveFilter("all")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Xóa lọc
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">Đang tải...</div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">
                Chưa có gói Premium nào. Hãy tạo gói đầu tiên.
              </p>
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

      {/* Tab 2: Subscription stats */}
      {tab === "stats" && <SubscriptionOverview />}

      <PremiumPlanFormModal
        open={modalOpen}
        editingPlan={editingPlan}
        onClose={() => setModalOpen(false)}
      />

      {/* Dialog deprecate — xuất hiện khi xóa gói còn user đang dùng */}
      {deprecateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Gói đã tắt nhưng chưa xóa hoàn toàn
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Còn <strong>{deprecateDialog.activeSubscriberCount}</strong> người dùng đang sử dụng.
              {deprecateDialog.lastExpiryDate && (
                <> Gói sẽ được dọn sạch sau{" "}
                  <strong>
                    {new Date(deprecateDialog.lastExpiryDate).toLocaleDateString("vi-VN")}
                  </strong>.
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Gói đã được đánh dấu "Đang deprecate" — không nhận đăng ký mới.
            </p>
            <button
              onClick={() => setDeprecateDialog(null)}
              className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "src/components/core";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import { usePremiumPlans, useAdminSubscriptions } from "src/query/premium/usePremiumQueries";
import type { AdminSubscription } from "src/services/api/functions/premium/premium.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

type StatusTab = "all" | "active" | "pending" | "expired";

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all",     label: "Tất cả"  },
  { value: "active",  label: "Active"  },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  Active:  { label: "Active",  cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"   },
  Pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  Expired: { label: "Expired", cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"       },
};

const PAGE_SIZE = 20;

function tabToIsActive(tab: StatusTab): boolean | undefined {
  if (tab === "active") return true;
  if (tab === "pending" || tab === "expired") return false;
  return undefined;
}

function applyStatusFilter(items: AdminSubscription[], tab: StatusTab): AdminSubscription[] {
  if (tab === "active")  return items.filter((x) => x.status === "Active");
  if (tab === "pending") return items.filter((x) => x.status === "Pending");
  if (tab === "expired") return items.filter((x) => x.status === "Expired");
  return items;
}

const SUB_TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả loại" },
  { value: "Monthly", label: "Hàng tháng" },
  { value: "Yearly", label: "Hàng năm" },
];

export function SubscriptionOverview() {
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [planId, setPlanId] = useState<number | undefined>(undefined);
  const [subscriptionType, setSubType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: allPlans = [] } = usePremiumPlans();
  const planOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Tất cả gói" },
    ...allPlans.map((p) => ({ value: String(p.planID), label: p.planName })),
  ], [allPlans]);

  const summaryQuery = useAdminSubscriptions({ pageSize: 999 });
  const summaryItems = summaryQuery.data?.data ?? [];
  const counts = {
    total:   summaryQuery.data?.totalCount ?? 0,
    active:  summaryItems.filter((x) => x.status === "Active").length,
    pending: summaryItems.filter((x) => x.status === "Pending").length,
    expired: summaryItems.filter((x) => x.status === "Expired").length,
  };

  const tableQuery = useAdminSubscriptions({
    page, pageSize: PAGE_SIZE, planId, subscriptionType,
    isActive: tabToIsActive(statusTab),
  });
  const tableItems = applyStatusFilter(tableQuery.data?.data ?? [], statusTab);
  const totalCount = tableQuery.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const changeTab = (tab: StatusTab) => { setStatusTab(tab); setPage(1); };

  const columns = useMemo<ColumnDef<AdminSubscription>[]>(() => [
    {
      id: "user",
      header: "Người dùng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{row.original.username}</p>
          {row.original.email && <p className="text-xs text-slate-400">{row.original.email}</p>}
        </div>
      ),
    },
    {
      id: "plan",
      header: "Gói",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">{row.original.planName}</p>
          <span className="text-xs text-slate-400">{row.original.planCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "subscriptionType",
      header: "Loại",
      cell: ({ getValue }) => {
        const t = String(getValue());
        return (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            t === "Monthly"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          }`}>
            {t === "Monthly" ? "Tháng" : "Năm"}
          </span>
        );
      },
    },
    {
      id: "period",
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p>{new Date(row.original.startDate).toLocaleDateString("vi-VN")}</p>
          <p className="mt-0.5">→ {new Date(row.original.endDate).toLocaleDateString("vi-VN")}</p>
        </div>
      ),
    },
    {
      accessorKey: "daysRemaining",
      header: "Còn lại",
      cell: ({ getValue }) => (
        <div className="text-right text-slate-600 dark:text-slate-300">
          {Number(getValue()) > 0 ? `${getValue()} ngày` : "—"}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ getValue }) => (
        <div className="text-right font-medium text-slate-700 dark:text-slate-200">
          {formatCurrency(Number(getValue()))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ getValue }) => {
        const badge = STATUS_BADGE[String(getValue())] ?? STATUS_BADGE["Expired"];
        return (
          <div className="flex justify-center">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng",    value: counts.total,   cls: "text-slate-700 dark:text-slate-100"  },
          { label: "Active",  value: counts.active,  cls: "text-green-600 dark:text-green-400"   },
          { label: "Pending", value: counts.pending, cls: "text-yellow-600 dark:text-yellow-400" },
          { label: "Expired", value: counts.expired, cls: "text-slate-400"                       },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.cls}`}>
              {summaryQuery.isLoading ? "—" : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
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
        <div className="flex flex-wrap gap-2">
          <Select
            options={planOptions}
            value={planId !== undefined ? String(planId) : ""}
            onChange={(e) => { setPlanId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="w-auto"
          />
          <Select
            options={SUB_TYPE_OPTIONS}
            value={subscriptionType ?? ""}
            onChange={(e) => { setSubType(e.target.value || undefined); setPage(1); }}
            className="w-auto"
          />
        </div>
      </div>

      <DataTable
        data={tableItems}
        columns={columns}
        loading={tableQuery.isLoading}
        getRowId={(row) => String(row.userPremiumID)}
        emptyTitle="Không có dữ liệu"
        emptyDescription="Chưa có subscription phù hợp với bộ lọc."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>Trang {page} / {totalPages} · {totalCount} bản ghi</p>
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
  );
}

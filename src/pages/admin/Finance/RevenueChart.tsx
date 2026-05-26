import { useMemo, useState } from "react";
import { useFinanceRevenue } from "src/query/finance/useFinanceQueries";

type Period = "7d" | "30d" | "3m" | "12m";

const PERIOD_CONFIG: Record<Period, { label: string; groupBy: string; days: number }> = {
  "7d":  { label: "7 ngày",   groupBy: "Day",   days: 7 },
  "30d": { label: "30 ngày",  groupBy: "Day",   days: 30 },
  "3m":  { label: "3 tháng",  groupBy: "Month", days: 90 },
  "12m": { label: "12 tháng", groupBy: "Month", days: 365 },
};

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtShort(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const cfg = PERIOD_CONFIG[period];

  const now = new Date();
  const fromDate = toISO(new Date(now.getTime() - cfg.days * 86400_000));
  const toDate = toISO(now);

  const { data, isLoading } = useFinanceRevenue({ fromDate, toDate, groupBy: cfg.groupBy });

  const points = data?.data ?? [];
  const maxSales = useMemo(() => Math.max(...points.map((p) => p.totalSales), 1), [points]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Doanh thu</h2>
          {data && (
            <p className="text-xs text-slate-400">
              Tổng: <span className="font-medium text-blue-600">{fmt(data.totalRevenue)}</span>
              &nbsp;·&nbsp;{data.totalOrders} đơn
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {(Object.keys(PERIOD_CONFIG) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {PERIOD_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-slate-400">Đang tải...</div>
      )}

      {!isLoading && points.length === 0 && (
        <div className="flex h-48 items-center justify-center text-slate-400">Không có dữ liệu.</div>
      )}

      {!isLoading && points.length > 0 && (
        <>
          {/* Revenue bars */}
          <div className="flex h-48 items-end gap-1 overflow-x-auto pb-2">
            {points.map((pt) => {
              const pct = maxSales ? (pt.totalSales / maxSales) * 100 : 0;
              return (
                <div key={pt.label} className="group relative flex flex-1 min-w-[24px] flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t-sm bg-blue-500 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white shadow-lg">
                    {pt.label}: {fmt(pt.totalSales)}
                    <br />{pt.orderCount} đơn
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-1 overflow-x-auto">
            {points.map((pt) => (
              <div key={pt.label} className="flex flex-1 min-w-[24px] justify-center">
                <span className="truncate text-[10px] text-slate-400">{pt.label.slice(-5)}</span>
              </div>
            ))}
          </div>

          {/* Order count bars */}
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Số đơn hàng</p>
            <div className="flex h-16 items-end gap-1 overflow-x-auto">
              {points.map((pt) => {
                const maxOrders = Math.max(...points.map((p) => p.orderCount), 1);
                const pct = (pt.orderCount / maxOrders) * 100;
                return (
                  <div key={pt.label} className="group relative flex flex-1 min-w-[24px] flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t-sm bg-emerald-400 hover:bg-emerald-500"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className="mt-0.5 text-[9px] text-slate-400">{pt.orderCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Y-axis hint */}
          <div className="mt-1 flex justify-between text-[10px] text-slate-300 dark:text-slate-600">
            <span>0</span>
            <span>{fmtShort(maxSales)}</span>
          </div>
        </>
      )}
    </div>
  );
}

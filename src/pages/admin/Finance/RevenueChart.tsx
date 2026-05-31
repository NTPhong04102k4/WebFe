import { useMemo, useState } from "react";
import { useFinanceRevenue } from "src/query/finance/useFinanceQueries";
import type { FinanceTimelinePoint } from "src/services/api/functions/finance/finance.api";

type Period = "7d" | "30d" | "3m" | "12m";

const PERIOD_CONFIG: Record<Period, { label: string; groupBy: "Day" | "Month"; days: number }> = {
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

/** Chú thích màu sắc cho biểu đồ */
const LEGEND = [
  { key: "orderRevenue",   label: "D.thu đơn hàng", color: "bg-blue-500"   },
  { key: "workshopRevenue",label: "D.thu Workshop",  color: "bg-cyan-400"   },
  { key: "payrollExpense", label: "Chi lương",       color: "bg-orange-400" },
  { key: "partsExpense",   label: "Chi phụ tùng",    color: "bg-amber-500"  },
  { key: "grossProfit",    label: "Lợi nhuận",       color: "bg-violet-500" },
] as const;

// ─── Props khi truyền từ Finance page ────────────────────────────────────────
interface RevenueChartProps {
  /** Nếu được truyền → chart tự dùng date range này, không hiện bộ chọn period riêng */
  fromDate?: string;
  toDate?: string;
  groupBy?: "Day" | "Month";
  /** Timeline từ /finance/summary */
  summaryTimeline?: FinanceTimelinePoint[];
  summaryLoading?: boolean;
}

// ─── Kiểu hợp nhất để hiển thị bar ──────────────────────────────────────────
interface DisplayPoint {
  label: string;
  orderRevenue: number;
  workshopRevenue: number;
  payrollExpense: number;
  partsExpense: number;
  grossProfit: number;
  totalSales: number;
  orderCount: number;
}

export function RevenueChart({
  fromDate: propFrom,
  toDate: propTo,
  groupBy: propGroupBy,
  summaryTimeline,
  summaryLoading,
}: RevenueChartProps) {
  // Nếu không truyền prop → chart tự quản lý period
  const [period, setPeriod] = useState<Period>("30d");
  const cfg = PERIOD_CONFIG[period];

  const standaloneNow = new Date();
  const standaloneFrom = toISO(new Date(standaloneNow.getTime() - cfg.days * 86400_000));
  const standaloneTo   = toISO(standaloneNow);

  const isControlled = !!propFrom;
  const fromDate = isControlled ? propFrom! : standaloneFrom;
  const toDate   = isControlled ? propTo!   : standaloneTo;
  const groupByVal = isControlled ? propGroupBy ?? "Day" : cfg.groupBy;

  // Luôn gọi hook (điều kiện hook không được đổi thứ tự)
  const { data: revenueData, isLoading: revenueLoading } = useFinanceRevenue({
    fromDate,
    toDate,
    groupBy: groupByVal,
  });

  // ─── Quyết định dữ liệu hiển thị ──────────────────────────────────────────
  const useSummary = isControlled && summaryTimeline && summaryTimeline.length > 0;
  const isLoading  = useSummary ? (summaryLoading ?? false) : revenueLoading;

  const points = useMemo<DisplayPoint[]>(() => {
    if (useSummary && summaryTimeline) {
      return summaryTimeline.map((t) => ({
        label:           t.label,
        orderRevenue:    t.orderRevenue,
        workshopRevenue: t.workshopRevenue,
        payrollExpense:  t.payrollExpense,
        partsExpense:    t.partsExpense,
        grossProfit:     t.grossProfit,
        totalSales:      t.totalRevenue,
        orderCount:      0,
      }));
    }
    return (revenueData?.data ?? []).map((p) => ({
      label:           p.label,
      orderRevenue:    p.totalSales,
      workshopRevenue: 0,
      payrollExpense:  0,
      partsExpense:    0,
      grossProfit:     p.totalSales,
      totalSales:      p.totalSales,
      orderCount:      p.orderCount,
    }));
  }, [useSummary, summaryTimeline, revenueData]);

  // Max dương để scale bar height
  const maxValue = useMemo(() => {
    if (points.length === 0) return 1;
    return Math.max(
      ...points.flatMap((p) => [
        p.orderRevenue,
        p.workshopRevenue,
        p.payrollExpense,
        p.partsExpense,
        Math.max(p.grossProfit, 0),
      ]),
      1,
    );
  }, [points]);

  const totalRevenue = revenueData?.totalRevenue ?? 0;
  const totalOrders  = revenueData?.totalOrders  ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* ── Tiêu đề + bộ chọn period ── */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Biểu đồ Doanh thu &amp; Chi phí
          </h2>
          {!isControlled && revenueData && (
            <p className="text-xs text-slate-400">
              Tổng doanh thu đơn hàng:{" "}
              <span className="font-medium text-blue-600">{fmt(totalRevenue)}</span>
              &nbsp;·&nbsp;{totalOrders} đơn
            </p>
          )}
          {useSummary && (
            <p className="text-xs text-slate-400">
              Hiển thị: doanh thu, chi phí và lợi nhuận theo kỳ
            </p>
          )}
        </div>

        {/* Chỉ hiện bộ chọn khi không controlled */}
        {!isControlled && (
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
        )}
      </div>

      {/* ── Legend ── */}
      {useSummary && (
        <div className="mb-3 flex flex-wrap gap-3">
          {LEGEND.map((l) => (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm ${l.color}`} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading / Empty states ── */}
      {isLoading && (
        <div className="flex h-52 items-center justify-center text-slate-400">
          Đang tải...
        </div>
      )}
      {!isLoading && points.length === 0 && (
        <div className="flex h-52 items-center justify-center text-slate-400">
          Không có dữ liệu.
        </div>
      )}

      {/* ── Biểu đồ chính ── */}
      {!isLoading && points.length > 0 && (
        <>
          {/* Bar groups */}
          <div className="flex h-52 items-end gap-1 overflow-x-auto pb-2">
            {points.map((pt) => {
              if (useSummary) {
                // 4 cột cho mỗi kỳ: order, workshop, payroll, profit
                const barData = [
                  { pct: (pt.orderRevenue    / maxValue) * 100, color: "bg-blue-500",   tooltip: `Đơn hàng: ${fmt(pt.orderRevenue)}`    },
                  { pct: (pt.workshopRevenue / maxValue) * 100, color: "bg-cyan-400",   tooltip: `Workshop: ${fmt(pt.workshopRevenue)}`  },
                  { pct: (pt.payrollExpense  / maxValue) * 100, color: "bg-orange-400", tooltip: `Chi lương: ${fmt(pt.payrollExpense)}`  },
                  { pct: (pt.partsExpense    / maxValue) * 100, color: "bg-amber-500",  tooltip: `Chi phụ tùng: ${fmt(pt.partsExpense)}`  },
                  { pct: Math.max(pt.grossProfit, 0) / maxValue * 100, color: pt.grossProfit >= 0 ? "bg-violet-500" : "bg-rose-500", tooltip: `Lợi nhuận: ${fmt(pt.grossProfit)}` },
                ];
                return (
                  <div
                    key={pt.label}
                    className="group relative flex flex-1 min-w-[40px] flex-col items-center justify-end"
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                      <p className="font-semibold mb-1">{pt.label}</p>
                      <p className="text-blue-300">Đơn hàng: {fmt(pt.orderRevenue)}</p>
                      <p className="text-cyan-300">Workshop: {fmt(pt.workshopRevenue)}</p>
                      <p className="text-orange-300">Chi lương: {fmt(pt.payrollExpense)}</p>
                      <p className="text-amber-300">Chi phụ tùng: {fmt(pt.partsExpense)}</p>
                      <p className={pt.grossProfit >= 0 ? "text-violet-300" : "text-rose-300"}>
                        Lợi nhuận: {fmt(pt.grossProfit)}
                      </p>
                    </div>
                    {/* 5 bars cạnh nhau */}
                    <div className="flex w-full items-end gap-px">
                      {barData.map((b, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm ${b.color} transition-all`}
                          style={{ height: `${Math.max(b.pct, 2)}%`, minHeight: "3px" }}
                          title={b.tooltip}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              // Chế độ đơn giản — chỉ totalSales
              const pct = (pt.totalSales / maxValue) * 100;
              return (
                <div
                  key={pt.label}
                  className="group relative flex flex-1 min-w-[24px] flex-col items-center justify-end"
                >
                  <div
                    className="w-full rounded-t-sm bg-blue-500 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white shadow-lg">
                    {pt.label}: {fmt(pt.totalSales)}
                    <br />
                    {pt.orderCount} đơn
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-1 overflow-x-auto">
            {points.map((pt) => (
              <div key={pt.label} className="flex flex-1 min-w-[24px] justify-center">
                <span className="truncate text-[10px] text-slate-400">
                  {pt.label.slice(-5)}
                </span>
              </div>
            ))}
          </div>

          {/* Số đơn hàng (chỉ khi không dùng summary) */}
          {!useSummary && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Số đơn hàng
              </p>
              <div className="flex h-16 items-end gap-1 overflow-x-auto">
                {points.map((pt) => {
                  const maxOrders = Math.max(...points.map((p) => p.orderCount), 1);
                  const pct = (pt.orderCount / maxOrders) * 100;
                  return (
                    <div
                      key={pt.label}
                      className="group relative flex flex-1 min-w-[24px] flex-col items-center justify-end"
                    >
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
          )}

          {/* Y-axis hint */}
          <div className="mt-1 flex justify-between text-[10px] text-slate-300 dark:text-slate-600">
            <span>0</span>
            <span>{fmtShort(maxValue)}</span>
          </div>
        </>
      )}
    </div>
  );
}

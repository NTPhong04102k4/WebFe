import { useCarStats } from '@/query/car/useCarQueries'

const STATUS_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE: { label: 'Còn hàng',     bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  RESERVED:  { label: 'Đang đặt cọc', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  SOLD:      { label: 'Đã bán',       bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
}

const CONDITION_META: Record<string, { icon: string; bg: string; text: string; border: string }> = {
  new:       { icon: '✨', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  used:      { icon: '🔧', bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200'   },
  certified: { icon: '🏅', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
}

function fmtPrice(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`
  return value.toLocaleString('vi-VN')
}

export function CarStatsPanel() {
  const { data: stats, isLoading } = useCarStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tổng xe</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{stats.totalCars}</p>
        </div>

        {stats.byStatus.map((s) => {
          const meta = STATUS_META[s.statusCode] ?? {
            label: s.statusName,
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
          }
          return (
            <div key={s.statusCode} className={`rounded-xl border ${meta.border} ${meta.bg} p-4 shadow-sm`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${meta.text}`}>{meta.label}</p>
              <p className={`mt-1 text-2xl font-bold ${meta.text}`}>{s.count}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {s.statusCode === 'SOLD'
                  ? `Doanh thu: ${fmtPrice(s.totalSalePrice)}`
                  : `Giá trị: ${fmtPrice(s.totalListPrice)}`}
              </p>
            </div>
          )
        })}
      </div>

      {stats.byCondition.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Phân loại theo tình trạng
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.byCondition.map((c) => {
              const meta = CONDITION_META[c.condition.toLowerCase()] ?? {
                icon: '🚗',
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                border: 'border-gray-200',
              }
              return (
                <div
                  key={c.condition}
                  className={`flex items-center gap-2 rounded-lg border ${meta.border} ${meta.bg} px-3 py-2`}
                >
                  <span className="text-base">{meta.icon}</span>
                  <div>
                    <span className={`text-xs font-semibold ${meta.text}`}>{c.label}</span>
                    <span className="ml-1.5 text-xs text-slate-500">
                      {c.count} xe · {fmtPrice(c.totalListPrice)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

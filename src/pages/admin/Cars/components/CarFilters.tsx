import { Input } from '@/components/core/Form/Input'
import { Select } from '@/components/core/Select/Select'
import type { SelectOption } from '@/components/core/Select/Select'

const STATUS_CHIPS = [
  { code: 'AVAILABLE', label: 'Còn hàng',  active: 'bg-green-600 text-white border-green-600',   inactive: 'border-green-200 text-green-700 hover:bg-green-50'   },
  { code: 'RESERVED',  label: 'Đặt cọc',   active: 'bg-yellow-500 text-white border-yellow-500',  inactive: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50' },
  { code: 'SOLD',      label: 'Đã bán',    active: 'bg-blue-600 text-white border-blue-600',      inactive: 'border-blue-200 text-blue-700 hover:bg-blue-50'      },
]

const CONDITION_CHIPS = [
  { code: 'new',       label: '✨ Xe mới',    active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
  { code: 'used',      label: '🔧 Xe cũ',    active: 'bg-slate-600 text-white border-slate-600',    inactive: 'border-slate-300 text-slate-600 hover:bg-slate-50'     },
  { code: 'certified', label: '🏅 Chứng thực', active: 'bg-purple-600 text-white border-purple-600', inactive: 'border-purple-200 text-purple-700 hover:bg-purple-50'  },
]

type Props = {
  search: string
  onSearchChange: (v: string) => void
  brandCode: string
  onBrandChange: (v: string) => void
  brandOptions: SelectOption[]
  brandsLoading: boolean
  bodyCode: string
  onBodyChange: (v: string) => void
  bodyOptions: SelectOption[]
  bodiesLoading: boolean
  priceFrom: string
  onPriceFromChange: (v: string) => void
  priceTo: string
  onPriceToChange: (v: string) => void
  statusCodes: string[]
  onStatusToggle: (code: string) => void
  conditions: string[]
  onConditionToggle: (code: string) => void
  onReset: () => void
}

export function CarFilters({
  search, onSearchChange,
  brandCode, onBrandChange, brandOptions, brandsLoading,
  bodyCode, onBodyChange, bodyOptions, bodiesLoading,
  priceFrom, onPriceFromChange,
  priceTo, onPriceToChange,
  statusCodes, onStatusToggle,
  conditions, onConditionToggle,
  onReset,
}: Props) {
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <Input
          label="Tên xe"
          value={search}
          placeholder="VD: Camry"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          label="Hãng xe"
          options={brandOptions}
          placeholder="Tất cả"
          value={brandCode}
          disabled={brandsLoading}
          onChange={(e) => onBrandChange(e.target.value)}
        />
        <Select
          label="Kiểu thân xe"
          options={bodyOptions}
          placeholder="Tất cả"
          value={bodyCode}
          disabled={bodiesLoading}
          onChange={(e) => onBodyChange(e.target.value)}
        />
        <Input
          label="Giá từ"
          inputMode="numeric"
          value={priceFrom}
          placeholder="VD: 100000000"
          onChange={(e) => onPriceFromChange(e.target.value)}
        />
        <Input
          label="Giá đến"
          inputMode="numeric"
          value={priceTo}
          placeholder="VD: 200000000"
          onChange={(e) => onPriceToChange(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_CHIPS.map(({ code, label, active, inactive }) => (
              <button
                key={code}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${statusCodes.includes(code) ? active : inactive}`}
                onClick={() => onStatusToggle(code)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tình trạng xe</span>
          <div className="flex flex-wrap gap-2">
            {CONDITION_CHIPS.map(({ code, label, active, inactive }) => (
              <button
                key={code}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${conditions.includes(code) ? active : inactive}`}
                onClick={() => onConditionToggle(code)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto self-end">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onReset}
          >
            Xoá bộ lọc
          </button>
        </div>
      </div>
    </>
  )
}

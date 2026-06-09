import { X, GitCompare } from 'lucide-react'
import type { CarResponseItem } from '@/shared/types/Reponse/Car'

interface CompareBarProps {
  compareList: CarResponseItem[]
  onToggle: (car: CarResponseItem) => void
  onClear: () => void
  onCompare: () => void
}

export function CompareBar({ compareList, onToggle, onClear, onCompare }: CompareBarProps) {
  if (compareList.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <GitCompare className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">
            So sánh ({compareList.length}/3):
          </span>
          <div className="flex gap-2">
            {compareList.map((car) => (
              <span
                key={car.carID}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {car.carName}
                <button
                  type="button"
                  onClick={() => onToggle(car)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Xóa tất cả
          </button>
          <button
            type="button"
            disabled={compareList.length < 2}
            onClick={onCompare}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            So sánh ngay
          </button>
        </div>
      </div>
    </div>
  )
}

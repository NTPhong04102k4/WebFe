import { formatCurrency } from '@/common/utils/formatCurrency'
import type { CarResponseItem } from '@/shared/types/Reponse/Car'
import EmptyState from '@/components/common/EmptyState'
import { getImageSrc } from '../carsHelpers'

type Props = {
  data: CarResponseItem[]
  onEdit: (car: CarResponseItem) => void
  onDelete: (car: CarResponseItem) => void
}

export function CarList({ data, onEdit, onDelete }: Props) {
  if (data.length === 0) {
    return <EmptyState title="Chưa có xe nào" description="Thêm xe mới để bắt đầu." />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-6 md:border-b md:border-slate-200 md:bg-slate-50">
        <div className="px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">Xe</div>
        <div className="px-4 py-3 text-sm font-semibold text-slate-700">Năm</div>
        <div className="px-4 py-3 text-sm font-semibold text-slate-700">Giá</div>
        <div className="px-4 py-3 text-sm font-semibold text-slate-700">Trạng thái</div>
        <div className="px-4 py-3 text-sm font-semibold text-slate-700">Hành động</div>
      </div>

      <div>
        {data.map((car) => {
          const img = getImageSrc(car)
          return (
            <div
              key={car.carID}
              className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 md:grid-cols-6 md:gap-2"
            >
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {img && <img className="h-full w-full object-cover" src={img} alt={car.carName} />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{car.carName}</div>
                  <div className="truncate text-xs text-slate-600">
                    Code: {car.carCode} • VIN: {car.vin}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-700">{car.modelYear}</div>
              <div className="text-sm font-semibold text-blue-700">
                {formatCurrency(car.salePrice ?? car.price)}
              </div>
              <div className="text-sm text-slate-700">
                {(car as any).isActive === false ? 'Inactive' : car.condition}
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => onEdit(car)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(car)}
                >
                  Xóa
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

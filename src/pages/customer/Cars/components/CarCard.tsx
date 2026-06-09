import { Link } from 'react-router-dom'
import { GitCompare, Eye, Star, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/common/utils/formatCurrency'
import type { CarResponseItem } from '@/shared/types/Reponse/Car'

interface CarCardProps {
  car: CarResponseItem
  img: string | undefined
  inCompare: boolean
  onToggleCompare: () => void
  inCart: boolean
  onAddToCart: () => void
}

export function CarCard({ car, img, inCompare, onToggleCompare, inCart, onAddToCart }: CarCardProps) {
  const unavailable = car.statusCode === 'RESERVED' || car.statusCode === 'SOLD'
  const cartTitle = car.statusCode === 'SOLD'
    ? 'Đã bán'
    : car.statusCode === 'RESERVED'
    ? 'Đang đặt cọc'
    : inCart
    ? 'Trong giỏ'
    : 'Thêm vào giỏ'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100">
        {img ? (
          <img className="h-full w-full object-fill" src={img} alt={car.carName} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
        {car.statusCode === 'RESERVED' && (
          <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
            Đặt cọc
          </span>
        )}
        {car.statusCode === 'SOLD' && (
          <span className="absolute left-2 top-2 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
            Đã bán
          </span>
        )}
        {car.isFeature && car.statusCode === 'AVAILABLE' && (
          <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            Nổi bật
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{car.carName}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{car.modelYear} • {car.condition}</p>

        <div className="mt-2 flex items-center justify-between gap-1.5">
          <div className="text-sm font-bold text-blue-700">
            {formatCurrency(car.salePrice ?? car.price)}
          </div>
          <div className="flex items-center gap-1">
            <Link
              to={`/cars/${car.carID}`}
              title="Chi tiết"
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={`/reviews/${car.carID}`}
              title="Review"
              className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100"
            >
              <Star className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              title="So sánh"
              onClick={onToggleCompare}
              className={`rounded-lg border p-1.5 transition-colors ${
                inCompare
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={cartTitle}
              className={`rounded-lg p-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                unavailable ? 'bg-slate-400' : inCart ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={onAddToCart}
              disabled={unavailable || inCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { carRouteFn } from '@/services/api/functions/Cars/Routes.Fn'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/common/utils/formatCurrency'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { CarDetailResponse } from '@/shared/types/Reponse/Car'

export default function CustomerCarDetailPage() {
  const addItem = useCartStore((s) => s.addItem)

  const params = useParams()
  const id = useMemo(() => {
    const raw = params.id
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }, [params.id])

  const { data, isLoading, error } = useQuery<CarDetailResponse, Error>({
    queryKey: ['customer-car-detail', id],
    enabled: !!id,
    queryFn: () => carRouteFn.getDetail(id!),
  })

  const car = data as any

  const carId = car?.carID ?? id ?? null
  const carName = car?.carName ?? `Xe #${carId ?? ''}`
  const img =
    (typeof car?.primaryImagePath === 'string' && car.primaryImagePath) ||
    (Array.isArray(car?.imagePaths) && car.imagePaths[0])
  const price = car?.salePrice ?? car?.price ?? 0

  const tech = car as any

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link to="/cars" className="text-sm font-medium text-blue-700 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative aspect-[4/3] bg-slate-100">
              {img ? (
                <img
                  className="h-full w-full object-cover"
                  src={img}
                  alt={carName}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-slate-900">{carName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {tech?.modelYear ? `Năm: ${tech.modelYear}` : null}
              {tech?.condition ? ` • Tình trạng: ${tech.condition}` : null}
            </p>

            <div className="mt-4 text-2xl font-bold text-blue-700">
              {formatCurrency(price)}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={() => {
                  if (!carId) {
                    toast.error('Không tìm thấy mã xe')
                    return
                  }
                  addItem({
                    type: 'car',
                    id: carId,
                    name: carName,
                    price,
                    imagePath: typeof img === 'string' ? img : undefined,
                  })
                  toast.success('Đã thêm vào giỏ hàng')
                }}
              >
                Thêm vào giỏ
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-500">Engine</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {tech?.engineCode || '—'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {typeof tech?.cylinders === 'number' ? `Cylinders: ${tech.cylinders}` : ''}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-500">Power / Torque</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {typeof tech?.maxPower_hp === 'number' ? `${tech.maxPower_hp} HP` : '—'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {typeof tech?.maxTorque_nm === 'number' ? `${tech.maxTorque_nm} Nm` : ''}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-500">Dimensions</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {typeof tech?.length_mm === 'number' ? `${tech.length_mm} mm` : '—'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {typeof tech?.width_mm === 'number' ? `W: ${tech.width_mm} mm` : ''}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-500">Performance</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {typeof tech?.topSpeed_kmh === 'number'
                    ? `${tech.topSpeed_kmh} km/h`
                    : typeof tech?.acceleration_0_100_sec === 'number'
                      ? `0-100: ${tech.acceleration_0_100_sec} sec`
                      : '—'}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Tính năng an toàn</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>ABS: {tech?.abs ? 'Có' : 'Không'}</div>
                <div>ESP: {tech?.esp ? 'Có' : 'Không'}</div>
                <div>Air Conditioning: {tech?.airConditioning ? 'Có' : 'Không'}</div>
                <div>Bluetooth: {tech?.bluetoothConnectivity ? 'Có' : 'Không'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


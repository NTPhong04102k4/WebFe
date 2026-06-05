import { useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { X, GitCompare, Eye, Star, ShoppingCart } from 'lucide-react'

import { carRouteFn } from '@/services/api/functions/Cars/Routes.Fn'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/common/utils/formatCurrency'
import type { CarResponse, CarResponseItem } from '@/shared/types/Reponse/Car'
import { useBrandCarList } from '@/query/brand-car/useBrandCarQueries'
import { useBodyTypeList } from '@/query/body-type/useBodyTypeQueries'
import { SelectField } from '@/shared/components/Form/SelectField'
import PremiumGateModal from '@/pages/customer/Premium/components/PremiumGateModal'

// ── Compare Modal ──────────────────────────────────────────────────────────────
const COMPARE_ROWS: { label: string; key: keyof CarResponseItem }[] = [
  { label: "Giá bán", key: "salePrice" },
  { label: "Năm SX", key: "modelYear" },
  { label: "Tình trạng", key: "condition" },
  { label: "Động cơ (cc)", key: "engineSize" },
  { label: "Nhiên liệu", key: "fuelType" },
  { label: "Hộp số", key: "transmission" },
  { label: "Dẫn động", key: "driveType" },
  { label: "Số chỗ", key: "seats" },
  { label: "Số cửa", key: "doors" },
  { label: "Màu sắc", key: "color" },
  { label: "Số km", key: "mileage" },
]

function CompareModal({ cars, onClose }: { cars: CarResponseItem[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-slate-800">So sánh xe</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 w-36 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Thông số
                </th>
                {cars.map((car) => {
                  const img = typeof car.primaryImagePath === 'string' ? car.primaryImagePath
                    : Array.isArray(car.imagePaths) ? car.imagePaths[0] : undefined
                  return (
                    <th key={car.carID} className="min-w-[180px] px-4 py-3 text-left">
                      {img && <img src={img} alt={car.carName} className="mb-2 h-24 w-full rounded-lg object-cover" />}
                      <div className="font-semibold text-slate-900 line-clamp-2">{car.carName}</div>
                      <div className="mt-1 text-lg font-bold text-blue-700">{formatCurrency(car.salePrice ?? car.price)}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(({ label, key }, i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="sticky left-0 bg-inherit px-4 py-2.5 text-xs font-medium text-slate-500">{label}</td>
                  {cars.map((car) => {
                    const val = car[key]
                    const display = key === "salePrice"
                      ? formatCurrency(Number(val))
                      : key === "mileage"
                      ? Number(val).toLocaleString("vi-VN") + " km"
                      : String(val ?? "—")
                    return (
                      <td key={car.carID} className="px-4 py-2.5 font-medium text-slate-800">{display}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center gap-3 border-t p-4">
          {cars.map((car) => (
            <Link
              key={car.carID}
              to={`/cars/${car.carID}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Xem {car.carName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function getImageSrc(car: CarResponseItem): string | undefined {
  const primary = car.primaryImagePath
  if (typeof primary === 'string' && primary.trim()) return primary
  const first = Array.isArray(car.imagePaths)
    ? car.imagePaths.find((x) => typeof x === 'string' && x.trim())
    : undefined
  return typeof first === 'string' ? first : undefined
}

export default function CustomerCarsPage() {
  const { addCar, isInCart } = useCart()
  const user = useAuthStore((s) => s.user)
  const [showPremiumGate, setShowPremiumGate] = useState(false)
  const [compareList, setCompareList] = useState<CarResponseItem[]>([])
  const [showCompare, setShowCompare] = useState(false)

  const toggleCompare = (car: CarResponseItem) => {
    setCompareList((prev) => {
      if (prev.some((c) => c.carID === car.carID))
        return prev.filter((c) => c.carID !== car.carID)
      if (prev.length >= 3) return prev // max 3
      return [...prev, car]
    })
  }
  const inCompare = (carID: number) => compareList.some((c) => c.carID === carID)
  const [searchParams] = useSearchParams()
  const { data: brandCars = [], isLoading: brandsLoading } = useBrandCarList()
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList()

  const [page, setPage] = useState(1)
  const pageSize = 12

  const [brandCode, setBrandCode] = useState(() => searchParams.get('brandCode') ?? '')
  const [bodyCode, setBodyCode] = useState(() => searchParams.get('bodyCode') ?? '')
  const [search, setSearch] = useState(() => searchParams.get('search') ?? searchParams.get('carName') ?? '')
  const [priceFrom, setPriceFrom] = useState<string>('')
  const [priceTo, setPriceTo] = useState<string>('')

  const priceFromNum = useMemo(() => {
    if (!priceFrom.trim()) return undefined
    const n = Number(priceFrom)
    return Number.isFinite(n) ? n : undefined
  }, [priceFrom])

  const priceToNum = useMemo(() => {
    if (!priceTo.trim()) return undefined
    const n = Number(priceTo)
    return Number.isFinite(n) ? n : undefined
  }, [priceTo])

  const queryKey = useMemo(
    () => [
      'customer-cars',
      page,
      pageSize,
      search,
      brandCode,
      bodyCode,
      priceFromNum,
      priceToNum,
    ],
    [page, pageSize, search, brandCode, bodyCode, priceFromNum, priceToNum]
  )

  const brandOptions = useMemo(
    () => brandCars.map((brand) => ({ value: brand.brandCode, label: brand.brandName })),
    [brandCars]
  )

  const bodyOptions = useMemo(
    () => bodyTypes.map((body) => ({ value: body.bodyCode, label: body.bodyName })),
    [bodyTypes]
  )

  const { data, isLoading, error } = useQuery<CarResponse, Error>({
    queryKey,
    placeholderData: keepPreviousData,
    queryFn: () =>
      carRouteFn.getPaging({
        pageIndex: page,
        pageSize,
        search: search.trim(),
        brandCode: brandCode.trim(),
        bodyCode: bodyCode.trim(),
        ...(priceFromNum !== undefined ? { priceFrom: priceFromNum } : {}),
        ...(priceToNum !== undefined ? { priceTo: priceToNum } : {}),
      }),
  })

  const total = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const cars = data?.data ?? []
  // Backend cap kết quả khi user không có premium (free tier tối đa 10)
  const isCapped = !isLoading && total > cars.length && !user

  return (
    <>
    {showPremiumGate && (
      <PremiumGateModal
        featureTitle="Xem toàn bộ danh sách xe"
        featureDescription="Nâng cấp Premium để xem tất cả xe không giới hạn."
        onClose={() => setShowPremiumGate(false)}
      />
    )}
    {showCompare && compareList.length >= 2 && (
      <CompareModal cars={compareList} onClose={() => setShowCompare(false)} />
    )}
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách xe</h1>
          <p className="mt-1 text-sm text-slate-600">
            Lọc theo mã hãng / mã dòng xe và khoảng giá
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Tên xe</span>
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              placeholder="VD: Camry"
            />
          </label>

          <SelectField
            label="Hãng xe"
            value={brandCode}
            options={brandOptions}
            disabled={brandsLoading}
            onChange={(e) => {
              setPage(1)
              setBrandCode(e.target.value)
            }}
          />

          <SelectField
            label="Kiểu thân xe"
            value={bodyCode}
            options={bodyOptions}
            disabled={bodiesLoading}
            onChange={(e) => {
              setPage(1)
              setBodyCode(e.target.value)
            }}
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Giá từ</span>
            <input
              inputMode="numeric"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={priceFrom}
              onChange={(e) => {
                setPage(1)
                setPriceFrom(e.target.value)
              }}
              placeholder="VD: 100000000"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Giá đến</span>
            <input
              inputMode="numeric"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={priceTo}
              onChange={(e) => {
                setPage(1)
                setPriceTo(e.target.value)
              }}
              placeholder="VD: 200000000"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setPage(1)
              setSearch('')
              setBrandCode('')
              setBodyCode('')
              setPriceFrom('')
              setPriceTo('')
            }}
          >
            Xoá bộ lọc
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-600">Đang tải...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car) => {
              const img = getImageSrc(car)
              return (
                <div
                  key={car.carID}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {img ? (
                      <img
                        className="h-full w-full object-fill"
                        src={img}
                        alt={car.carName}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                    {car.statusCode === "RESERVED" && (
                      <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Đặt cọc
                      </span>
                    )}
                    {car.statusCode === "SOLD" && (
                      <span className="absolute left-2 top-2 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
                        Đã bán
                      </span>
                    )}
                    {car.isFeature && car.statusCode === "AVAILABLE" && (
                      <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Nổi bật
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {car.carName}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {car.modelYear} • {car.condition}
                    </p>

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
                          onClick={() => toggleCompare(car)}
                          className={`rounded-lg border p-1.5 transition-colors ${
                            inCompare(car.carID)
                              ? "border-green-400 bg-green-50 text-green-700"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                        </button>
                        {(() => {
                          const unavailable = car.statusCode === "RESERVED" || car.statusCode === "SOLD";
                          const inCart = isInCart('car', car.carID);
                          const cartTitle = car.statusCode === "SOLD"
                            ? "Đã bán"
                            : car.statusCode === "RESERVED"
                            ? "Đang đặt cọc"
                            : inCart
                            ? "Trong giỏ"
                            : "Thêm vào giỏ";
                          return (
                            <button
                              type="button"
                              title={cartTitle}
                              className={`rounded-lg p-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                unavailable
                                  ? "bg-slate-400"
                                  : inCart
                                  ? "bg-green-600"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                              onClick={() =>
                                !unavailable && void addCar({
                                  carId: car.carID,
                                  name: car.carName,
                                  price: car.salePrice ?? car.price,
                                  imagePath: img,
                                })
                              }
                              disabled={unavailable || inCart}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <div className="text-sm text-slate-600">
              Trang{' '}
              <strong className="font-semibold text-slate-900">{page}</strong> /{' '}
              {totalPages}
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </button>
          </div>

          {isCapped && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm text-amber-800">
                Đang xem <strong>{cars.length}</strong>/{total} xe.{' '}
                <button
                  type="button"
                  className="font-semibold text-amber-700 underline"
                  onClick={() => setShowPremiumGate(true)}
                >
                  Nâng cấp Premium
                </button>{' '}
                để xem toàn bộ danh sách.
              </p>
            </div>
          )}
        </>
      )}
    </div>

    {/* Floating compare bar */}
    {compareList.length > 0 && (
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
                  <button type="button" onClick={() => toggleCompare(car)} className="ml-1 hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Xóa tất cả
            </button>
            <button
              type="button"
              disabled={compareList.length < 2}
              onClick={() => setShowCompare(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              So sánh ngay
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

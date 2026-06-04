import { useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

import { carRouteFn } from '@/services/api/functions/Cars/Routes.Fn'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/common/utils/formatCurrency'
import type { CarResponse, CarResponseItem } from '@/shared/types/Reponse/Car'
import { useBrandCarList } from '@/query/brand-car/useBrandCarQueries'
import { useBodyTypeList } from '@/query/body-type/useBodyTypeQueries'
import { SelectField } from '@/shared/components/Form/SelectField'
import PremiumGateModal from '@/pages/customer/Premium/components/PremiumGateModal'

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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const img = getImageSrc(car)
              return (
                <div
                  key={car.carID}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {img ? (
                      <img
                        className="h-full w-full object-cover"
                        src={img}
                        alt={car.carName}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        No image
                      </div>
                    )}
                    {/* Badge trạng thái */}
                    {car.statusCode === "RESERVED" && (
                      <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Đang đặt cọc
                      </span>
                    )}
                    {car.statusCode === "SOLD" && (
                      <span className="absolute left-2 top-2 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
                        Đã bán
                      </span>
                    )}
                    {/* Badge nổi bật */}
                    {car.isFeature && car.statusCode === "AVAILABLE" && (
                      <span className="absolute right-2 top-2 rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Nổi bật
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                      {car.carName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Năm: {car.modelYear} • Tình trạng: {car.condition}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(car.salePrice ?? car.price)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/cars/${car.carID}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          to={`/reviews/${car.carID}`}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                        >
                          Review
                        </Link>
                        {(() => {
                          const unavailable = car.statusCode === "RESERVED" || car.statusCode === "SOLD";
                          const inCart = isInCart('car', car.carID);
                          const label = car.statusCode === "SOLD"
                            ? "Đã bán"
                            : car.statusCode === "RESERVED"
                            ? "Đang đặt cọc"
                            : inCart
                            ? "Trong giỏ"
                            : "Thêm";
                          return (
                            <button
                              type="button"
                              className={`rounded-lg px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                unavailable
                                  ? "bg-slate-400"
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
                              {label}
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
    </>
  )
}

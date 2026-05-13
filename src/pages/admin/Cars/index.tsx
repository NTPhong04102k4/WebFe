import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { carRouteFn } from '@/services/api/functions/Cars/Routes.Fn'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/common/utils/formatCurrency'
import type { CarResponse, CarResponseItem } from '@/shared/types/Reponse/Car'
import { useBrandCarList } from '@/query/brand-car/useBrandCarQueries'
import { useBodyTypeList } from '@/query/body-type/useBodyTypeQueries'
import { SelectField } from '@/shared/components/Form/SelectField'

type CarCondition = 'New' | 'Used' | 'Certified' | string

type CarFormState = {
  carCode: string
  vin: string
  carName: string
  modelYear: string
  modelName: string
  brandID: string
  bodyTypeID: string
  statusID: string
  condition: CarCondition
  locationID: string
  price: string
  importPrice: string
  salePrice: string
  engineSize: string
  fuelType: string
  transmission: string
  driveType: string
  doors: string
  seats: string
  color: string
  mileage: string
  shortDescription: string
  detailedDescription: string
  isFeature: boolean
  isActive: boolean
  imageFiles: File[]
  videoFile: File | null
}

const emptyForm: CarFormState = {
  carCode: '',
  vin: '',
  carName: '',
  modelYear: '',
  modelName: '',
  brandID: '',
  bodyTypeID: '',
  statusID: '',
  condition: 'New',
  locationID: '',
  price: '',
  importPrice: '',
  salePrice: '',
  engineSize: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  driveType: 'FWD',
  doors: '4',
  seats: '',
  color: 'Đen',
  mileage: '',
  shortDescription: '',
  detailedDescription: '',
  isFeature: false,
  isActive: true,
  imageFiles: [],
  videoFile: null,
}

function getImageSrc(car: CarResponseItem): string | undefined {
  const primary = car.primaryImagePath
  if (typeof primary === 'string' && primary.trim()) return primary
  const first = Array.isArray(car.imagePaths)
    ? car.imagePaths.find((x) => typeof x === 'string' && x.trim())
    : undefined
  return typeof first === 'string' ? first : undefined
}

function toNumberOrZero(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function appendIfNotEmpty(fd: FormData, key: string, value: string) {
  if (!value.trim()) return
  fd.append(key, value)
}

export default function AdminCarsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { data: brandCars = [], isLoading: brandsLoading } = useBrandCarList()
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList()

  const [page, setPage] = useState(1)
  const pageSize = 10

  const [brandCode, setBrandCode] = useState('')
  const [bodyCode, setBodyCode] = useState('')
  const [search, setSearch] = useState('')
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
      'admin-cars',
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

  const brandIdOptions = useMemo(
    () =>
      brandCars.map((brand) => ({
        value: String(brand.id),
        label: brand.brandName,
      })),
    [brandCars]
  )

  const bodyTypeIdOptions = useMemo(
    () =>
      bodyTypes.map((body, index) => ({
        value: String(index + 1),
        label: body.bodyName,
      })),
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

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingCar, setEditingCar] = useState<CarResponseItem | null>(null)

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CarFormState>({
    defaultValues: emptyForm,
    mode: 'onBlur',
  })
  const watchedImageFiles = watch('imageFiles')
  const watchedVideoFile = watch('videoFile')

  useEffect(() => {
    if (!modalOpen) return
    if (mode !== 'edit' || !editingCar) return

    reset({
      carCode: editingCar.carCode ?? '',
      vin: editingCar.vin ?? '',
      carName: editingCar.carName ?? '',
      modelYear: String(editingCar.modelYear ?? ''),
      modelName: editingCar.modelName ?? '',
      brandID: String(editingCar.brandID ?? ''),
      bodyTypeID: String(editingCar.bodyTypeID ?? ''),
      statusID: String(editingCar.statusID ?? ''),
      condition: editingCar.condition ?? 'New',
      locationID: String(editingCar.locationID ?? ''),
      price: String(editingCar.price ?? ''),
      importPrice:
        editingCar.importPrice === null || editingCar.importPrice === undefined
          ? ''
          : String(editingCar.importPrice),
      salePrice: String(editingCar.salePrice ?? ''),
      engineSize: String((editingCar.engineSize as any) ?? ''),
      fuelType: String(editingCar.fuelType ?? 'Petrol'),
      transmission: String((editingCar as any).transmission ?? 'Automatic'),
      driveType: String((editingCar as any).driveType ?? 'FWD'),
      doors: String((editingCar as any).doors ?? '4'),
      seats: String((editingCar as any).seats ?? ''),
      color: String((editingCar as any).color ?? 'Đen'),
      mileage: String((editingCar as any).mileage ?? ''),
      shortDescription: String(editingCar.shortDescription ?? ''),
      detailedDescription: String(editingCar.detailedDescription ?? ''),
      isFeature: Boolean(editingCar.isFeature ?? false),
      isActive: Boolean((editingCar as any).isActive ?? true),
      imageFiles: [],
      videoFile: null,
    })
  }, [modalOpen, mode, editingCar, reset])

  useEffect(() => {
    if (!modalOpen) return
    if (mode !== 'create') return
    reset(emptyForm)
  }, [modalOpen, mode, reset])

  const buildCarFormData = (values: CarFormState) => {
    if (!user) throw new Error('Bạn cần đăng nhập')

    const fd = new FormData()

    // Auth info
    fd.append('userUUID', String(user.id ?? 0))
    fd.append('roles', user.role ?? '')
    fd.append('CreatedBy', String(user.id ?? 0))

    // Basic fields
    appendIfNotEmpty(fd, 'CarCode', values.carCode)
    appendIfNotEmpty(fd, 'VIN', values.vin)
    appendIfNotEmpty(fd, 'CarName', values.carName)
    fd.append('ModelYear', String(toNumberOrZero(values.modelYear)))
    appendIfNotEmpty(fd, 'ModelName', values.modelName)
    fd.append('BrandID', String(toNumberOrZero(values.brandID)))
    fd.append('BodyTypeID', String(toNumberOrZero(values.bodyTypeID)))
    fd.append('StatusID', String(toNumberOrZero(values.statusID)))
    appendIfNotEmpty(fd, 'Condition', String(values.condition))
    fd.append('LocationID', String(toNumberOrZero(values.locationID)))

    fd.append('Price', String(toNumberOrZero(values.price)))
    fd.append('ImportPrice', String(toNumberOrZero(values.importPrice)))
    fd.append('SalePrice', String(toNumberOrZero(values.salePrice)))

    fd.append('EngineSize', String(toNumberOrZero(values.engineSize)))
    appendIfNotEmpty(fd, 'FuelType', values.fuelType)
    appendIfNotEmpty(fd, 'Transmission', values.transmission)
    appendIfNotEmpty(fd, 'DriveType', values.driveType)
    fd.append('Doors', String(toNumberOrZero(values.doors)))
    fd.append('Seats', String(toNumberOrZero(values.seats)))
    appendIfNotEmpty(fd, 'Color', values.color)
    fd.append('Mileage', String(toNumberOrZero(values.mileage)))

    // Descriptions
    fd.append('ShortDescription', values.shortDescription || '')
    fd.append('DetailedDescription', values.detailedDescription || '')
    fd.append('IsFeature', String(values.isFeature))

    // Tech/extra
    fd.append('ViewCount', '0')
    fd.append('SoldDate', '')
    fd.append('IsActive', String(values.isActive))

    // Files
    values.imageFiles.forEach((f) => fd.append('ImageFiles', f))
    if (values.videoFile) fd.append('VideoFile', values.videoFile)

    return fd
  }

  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => carRouteFn.create(fd),
    onSuccess: () => {
      toast.success('Tạo xe thành công')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Tạo xe thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }: { id: number; fd: FormData }) =>
      carRouteFn.update(id, fd),
    onSuccess: () => {
      toast.success('Cập nhật xe thành công')
      setModalOpen(false)
      setEditingCar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Cập nhật xe thất bại'),
  })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý xe</h1>
            <p className="mt-1 text-sm text-slate-600">List / filter / tạo & cập nhật</p>
          </div>

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => {
              setMode('create')
              setEditingCar(null)
              setModalOpen(true)
            }}
          >
            + Tạo xe
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
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

        <div className="mt-4 flex items-center justify-end">
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
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-6 md:border-b md:border-slate-200 md:bg-slate-50">
              <div className="px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">
                Xe
              </div>
              <div className="px-4 py-3 text-sm font-semibold text-slate-700">Năm</div>
              <div className="px-4 py-3 text-sm font-semibold text-slate-700">Giá</div>
              <div className="px-4 py-3 text-sm font-semibold text-slate-700">Trạng thái</div>
              <div className="px-4 py-3 text-sm font-semibold text-slate-700">Hành động</div>
            </div>

            <div>
              {(data?.data ?? []).map((car) => {
                const img = getImageSrc(car)
                return (
                  <div
                    key={car.carID}
                    className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 md:grid-cols-6 md:gap-2"
                  >
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {img ? (
                          <img
                            className="h-full w-full object-cover"
                            src={img}
                            alt={car.carName}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {car.carName}
                        </div>
                        <div className="truncate text-xs text-slate-600">
                          Code: {car.carCode} • VIN: {car.vin}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700">
                      {car.modelYear}
                    </div>
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
                        onClick={() => {
                          setMode('edit')
                          setEditingCar(car)
                          setModalOpen(true)
                        }}
                      >
                        Sửa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
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
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {mode === 'create' ? 'Tạo xe' : 'Chỉnh sửa xe'}
                </div>
                <div className="text-xs text-slate-500">
                  {mode === 'create' ? 'Nhập thông tin để tạo mới' : 'Cập nhật dữ liệu xe'}
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setModalOpen(false)}
              >
                Đóng
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-4 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Car code</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('carCode')}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">VIN</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('vin')}
                  />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Tên xe</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('carName', { required: 'Vui lòng nhập tên xe' })}
                  />
                  {errors.carName ? (
                    <span className="text-xs text-red-600">{errors.carName.message}</span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Model year</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('modelYear', { required: 'Vui lòng nhập năm sản xuất' })}
                  />
                  {errors.modelYear ? (
                    <span className="text-xs text-red-600">{errors.modelYear.message}</span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Model name</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('modelName')}
                  />
                </label>

                <SelectField
                  label="Hãng xe"
                  options={brandIdOptions}
                  placeholder="Chọn hãng xe"
                  disabled={brandsLoading}
                  {...register('brandID', { required: 'Vui lòng chọn hãng xe' })}
                />
                <SelectField
                  label="Kiểu thân xe"
                  options={bodyTypeIdOptions}
                  placeholder="Chọn kiểu thân xe"
                  disabled={bodiesLoading}
                  {...register('bodyTypeID', { required: 'Vui lòng chọn kiểu thân xe' })}
                />

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Status ID</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('statusID')}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Location ID</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('locationID')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Tình trạng</span>
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('condition')}
                  >
                    <option value="New">Xe mới</option>
                    <option value="Used">Xe cũ</option>
                    <option value="Certified">Xe cũ đã chứng nhận</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Giá (Price)</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('price', { required: 'Vui lòng nhập giá' })}
                  />
                  {errors.price ? (
                    <span className="text-xs text-red-600">{errors.price.message}</span>
                  ) : null}
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Import price</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('importPrice')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Sale price</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('salePrice')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Engine size</span>
                  <input
                    inputMode="decimal"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('engineSize')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Fuel type</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('fuelType')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Transmission</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('transmission')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Drive type</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('driveType')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Doors</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('doors')}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Seats</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('seats')}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Color</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('color')}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Mileage</span>
                  <input
                    inputMode="numeric"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('mileage')}
                  />
                </label>

                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Short description</span>
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('shortDescription')}
                  />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Detailed description</span>
                  <textarea
                    className="min-h-[96px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    {...register('detailedDescription')}
                  />
                </label>

                <label className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    {...register('isFeature')}
                  />
                  <span className="text-sm font-medium text-slate-700">Xe nổi bật</span>
                </label>

                <label className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                  />
                  <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
                </label>

                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Ảnh (ImageFiles)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="text-sm"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : []
                      setValue('imageFiles', files, { shouldDirty: true })
                    }}
                  />
                  {watchedImageFiles.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Đã chọn {watchedImageFiles.length} ảnh
                    </div>
                  )}
                </label>

                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Video (VideoFile)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setValue('videoFile', f, { shouldDirty: true })
                    }}
                  />
                  {watchedVideoFile && (
                    <div className="text-xs text-slate-500">
                      Đã chọn: {watchedVideoFile.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setModalOpen(false)}
              >
                Huỷ
              </button>

              <button
                type="button"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={handleSubmit(async (values) => {
                  try {
                    const fd = buildCarFormData(values)
                    if (mode === 'create') {
                      await createMutation.mutateAsync(fd)
                    } else {
                      if (!editingCar) throw new Error('Không có xe để cập nhật')
                      await updateMutation.mutateAsync({ id: editingCar.carID, fd })
                    }
                  } catch (e: any) {
                    toast.error(e?.message ?? 'Có lỗi xảy ra')
                  }
                })}
              >
                {mode === 'create' ? 'Tạo xe' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


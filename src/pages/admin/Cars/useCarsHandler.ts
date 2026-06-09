import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/components/core/Feedback/toast'
import { carRouteFn } from '@/services/api/functions/Cars/Routes.Fn'
import { useBrandCarList } from '@/query/brand-car/useBrandCarQueries'
import { useBodyTypeList } from '@/query/body-type/useBodyTypeQueries'
import { useCarStatusList } from '@/query/car/useCarQueries'
import { useLocationList } from '@/query/location/useLocationQueries'
import type { CarResponse, CarResponseItem } from '@/shared/types/Reponse/Car'
import type { SelectOption } from '@/components/core/Select/Select'

const PAGE_SIZE = 10

export type CarsHandlerReturn = {
  data: CarResponseItem[]
  total: number
  totalPages: number
  isLoading: boolean
  error: Error | null
  page: number
  search: string
  brandCode: string
  bodyCode: string
  priceFrom: string
  priceTo: string
  statusCodes: string[]
  conditions: string[]
  brandOptions: SelectOption[]
  bodyOptions: SelectOption[]
  brandsLoading: boolean
  bodiesLoading: boolean
  brandIdOptions: SelectOption[]
  bodyTypeIdOptions: SelectOption[]
  carStatusOptions: SelectOption[]
  locationOptions: SelectOption[]
  handleSearchChange: (v: string) => void
  handleBrandChange: (v: string) => void
  handleBodyChange: (v: string) => void
  handlePriceFromChange: (v: string) => void
  handlePriceToChange: (v: string) => void
  handleStatusToggle: (code: string) => void
  handleConditionToggle: (code: string) => void
  handleResetFilters: () => void
  handlePagePrev: () => void
  handlePageNext: () => void
  modalOpen: boolean
  mode: 'create' | 'edit'
  editingCar: CarResponseItem | null
  deleteConfirmCar: CarResponseItem | null
  openCreateModal: () => void
  openEditModal: (car: CarResponseItem) => void
  closeModal: () => void
  openDeleteConfirm: (car: CarResponseItem) => void
  closeDeleteConfirm: () => void
  isSaving: boolean
  isDeleting: boolean
  handleSave: (fd: FormData) => Promise<void>
  handleDelete: () => void
}

export function useCarsHandler(): CarsHandlerReturn {
  const queryClient = useQueryClient()

  const { data: brandCars = [], isLoading: brandsLoading } = useBrandCarList()
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList()
  const { data: carStatuses = [] } = useCarStatusList()
  const { data: locations = [] } = useLocationList()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [brandCode, setBrandCode] = useState('')
  const [bodyCode, setBodyCode] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [statusCodes, setStatusCodes] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingCar, setEditingCar] = useState<CarResponseItem | null>(null)
  const [deleteConfirmCar, setDeleteConfirmCar] = useState<CarResponseItem | null>(null)

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
    () => ['admin-cars', page, PAGE_SIZE, search, brandCode, bodyCode, priceFromNum, priceToNum, statusCodes, conditions],
    [page, search, brandCode, bodyCode, priceFromNum, priceToNum, statusCodes, conditions]
  )

  const { data, isLoading, error } = useQuery<CarResponse, Error>({
    queryKey,
    placeholderData: keepPreviousData,
    queryFn: () =>
      carRouteFn.getPaging({
        pageIndex: page,
        pageSize: PAGE_SIZE,
        search: search.trim(),
        brandCode: brandCode.trim(),
        bodyCode: bodyCode.trim(),
        ...(priceFromNum !== undefined ? { priceFrom: priceFromNum } : {}),
        ...(priceToNum !== undefined ? { priceTo: priceToNum } : {}),
        ...(statusCodes.length > 0 ? { statusCodes } : {}),
        ...(conditions.length > 0 ? { conditions } : {}),
      }),
  })

  const total = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const brandOptions = useMemo<SelectOption[]>(
    () => brandCars.map((b) => ({ value: b.brandCode, label: b.brandName })),
    [brandCars]
  )
  const bodyOptions = useMemo<SelectOption[]>(
    () => bodyTypes.map((b) => ({ value: b.bodyCode, label: b.bodyName })),
    [bodyTypes]
  )
  const brandIdOptions = useMemo<SelectOption[]>(
    () => brandCars.map((b) => ({ value: String(b.id), label: b.brandName })),
    [brandCars]
  )
  const bodyTypeIdOptions = useMemo<SelectOption[]>(
    () => bodyTypes.map((b, i) => ({ value: String(i + 1), label: b.bodyName })),
    [bodyTypes]
  )
  const carStatusOptions = useMemo<SelectOption[]>(
    () => carStatuses.filter((s) => s.isActive).map((s) => ({ value: String(s.statusID), label: s.statusName })),
    [carStatuses]
  )
  const locationOptions = useMemo<SelectOption[]>(
    () => locations.map((loc) => ({ value: String(loc.locationID), label: loc.locationName })),
    [locations]
  )

  const deleteMutation = useMutation({
    mutationFn: (id: number) => carRouteFn.delete(id),
    onSuccess: () => {
      notify.success('Xóa xe thành công')
      setDeleteConfirmCar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => carRouteFn.create(fd),
    onSuccess: () => {
      notify.success('Tạo xe thành công')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => carRouteFn.update(id, fd),
    onSuccess: () => {
      notify.success('Cập nhật xe thành công')
      setModalOpen(false)
      setEditingCar(null)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
  })

  const handleSave = async (fd: FormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(fd)
      } else {
        if (!editingCar) return
        await updateMutation.mutateAsync({ id: editingCar.carID, fd })
      }
    } catch {
      // interceptor đã hiện toast lỗi
    }
  }

  return {
    data: data?.data ?? [],
    total,
    totalPages,
    isLoading,
    error: error ?? null,
    page,
    search,
    brandCode,
    bodyCode,
    priceFrom,
    priceTo,
    statusCodes,
    conditions,
    brandOptions,
    bodyOptions,
    brandsLoading,
    bodiesLoading,
    brandIdOptions,
    bodyTypeIdOptions,
    carStatusOptions,
    locationOptions,
    handleSearchChange: (v) => { setPage(1); setSearch(v) },
    handleBrandChange: (v) => { setPage(1); setBrandCode(v) },
    handleBodyChange: (v) => { setPage(1); setBodyCode(v) },
    handlePriceFromChange: (v) => { setPage(1); setPriceFrom(v) },
    handlePriceToChange: (v) => { setPage(1); setPriceTo(v) },
    handleStatusToggle: (code) => {
      setPage(1)
      setStatusCodes((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
    },
    handleConditionToggle: (code) => {
      setPage(1)
      setConditions((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
    },
    handleResetFilters: () => {
      setPage(1); setSearch(''); setBrandCode(''); setBodyCode('')
      setPriceFrom(''); setPriceTo(''); setStatusCodes([]); setConditions([])
    },
    handlePagePrev: () => setPage((p) => Math.max(1, p - 1)),
    handlePageNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    modalOpen,
    mode,
    editingCar,
    deleteConfirmCar,
    openCreateModal: () => { setMode('create'); setEditingCar(null); setModalOpen(true) },
    openEditModal: (car) => { setMode('edit'); setEditingCar(car); setModalOpen(true) },
    closeModal: () => setModalOpen(false),
    openDeleteConfirm: (car) => setDeleteConfirmCar(car),
    closeDeleteConfirm: () => setDeleteConfirmCar(null),
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleSave,
    handleDelete: () => { if (deleteConfirmCar) deleteMutation.mutate(deleteConfirmCar.carID) },
  }
}

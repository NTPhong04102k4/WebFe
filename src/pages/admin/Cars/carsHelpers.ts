import type { CarResponseItem } from '@/shared/types/Reponse/Car'

export type CarCondition = 'New' | 'Used' | 'Certified' | string

export type CarFormState = {
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

export const emptyForm: CarFormState = {
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

export function getImageSrc(car: CarResponseItem): string | undefined {
  const primary = car.primaryImagePath
  if (typeof primary === 'string' && primary.trim()) return primary
  const first = Array.isArray(car.imagePaths)
    ? car.imagePaths.find((x) => typeof x === 'string' && x.trim())
    : undefined
  return typeof first === 'string' ? first : undefined
}

export function toNumberOrZero(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function appendIfNotEmpty(fd: FormData, key: string, value: string): void {
  if (!value.trim()) return
  fd.append(key, value)
}

export function buildCarFormData(
  values: CarFormState,
  user: { id?: string | number | null; role?: string | null } | null
): FormData {
  if (!user) throw new Error('Bạn cần đăng nhập')

  const fd = new FormData()

  fd.append('userUUID', String(user.id ?? 0))
  fd.append('roles', user.role ?? '')
  fd.append('CreatedBy', String(user.id ?? 0))

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

  fd.append('ShortDescription', values.shortDescription || '')
  fd.append('DetailedDescription', values.detailedDescription || '')
  fd.append('IsFeature', String(values.isFeature))

  fd.append('ViewCount', '0')
  fd.append('SoldDate', '')
  fd.append('IsActive', String(values.isActive))

  values.imageFiles.forEach((f) => fd.append('ImageFiles', f))
  if (values.videoFile) fd.append('VideoFile', values.videoFile)

  return fd
}

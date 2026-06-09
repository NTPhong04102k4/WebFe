import type { CarResponseItem } from '@/shared/types/Reponse/Car'

export function getImageSrc(car: CarResponseItem): string | undefined {
  const primary = car.primaryImagePath
  if (typeof primary === 'string' && primary.trim()) return primary
  const first = Array.isArray(car.imagePaths)
    ? car.imagePaths.find((x) => typeof x === 'string' && x.trim())
    : undefined
  return typeof first === 'string' ? first : undefined
}

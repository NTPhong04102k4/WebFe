import api from './axiosInstance'
import { API } from '@/services/api/endpoints'
import type {
  CarDetailResponse,
  CarResponse,
} from '@/shared/types/Reponse/Car'
import type { CarPagingRequest } from '@/shared/types/Request/Car'

function normalizePagingParams(params: CarPagingRequest) {
  return {
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 20,
    BrandCode: params.brandCode ?? '',
    BodyCode: params.bodyCode ?? '',
    PriceFrom: params.PriceFrom ?? undefined,
    PriceTo: params.PriceTo ?? undefined,
  }
}

export const carsApi = {
  getCarsPaging: async (params: CarPagingRequest) => {
    const response = await api.post<CarResponse>(
      API.car.paging,
      normalizePagingParams(params)
    )
    return response.data
  },

  getCarDetail: async (id: number) => {
    const response = await api.get<CarDetailResponse>(API.car.detail, {
      params: { id },
    })
    return response.data
  },

  createCar: async (formData: FormData) => {
    const response = await api.post<CarDetailResponse>(API.car.create, formData)
    return response.data
  },

  updateCar: async (id: number, formData: FormData) => {
    const response = await api.put<CarDetailResponse>(API.car.edit, formData, {
      params: { id },
    })
    return response.data
  },
}


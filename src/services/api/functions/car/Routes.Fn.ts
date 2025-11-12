import apiClient from "../..";
import { carRoute } from "./Routes";
import { CarListRequest } from "src/shared/types/Request/car";
import { CarListResponse, CarListItem } from "src/shared/types/Reponse/Car";

export const carRouteFn = {
  getCars: async (params: CarListRequest = {}) => {
    const response = await apiClient.post<CarListResponse>(
      carRoute.list,
      null,
      {
        params: {
          PageIndex: params.pageIndex ?? undefined,
          PageSize: params.pageSize ?? undefined,
          BodyCode: params.bodyCode ?? undefined,
          BrandCode: params.brandCode ?? undefined,
          PriceFrom: params.priceFrom ?? undefined,
          PriceTo: params.priceTo ?? undefined,
        },
      }
    );
    return response.data;
  },
  getCarDetail: async (id: number) => {
    const response = await apiClient.get<CarListItem>(carRoute.detail, {
      params: { id },
    });
    return response.data;
  },
};

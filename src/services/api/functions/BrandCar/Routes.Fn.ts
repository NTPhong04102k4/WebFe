import { BrandCarResponse } from "src/shared/types/Reponse/Car";
import apiClient from "../..";
import { brandCarRoute } from "./Routes";
import type { OperationResult } from "src/services/types/common.types";

export type BrandCarPayload = {
  brandCode: string;
  brandName: string;
  logo?: File | string | null;
  logoPath?: string | null;
  description?: string | null;
  countryOrigin?: string | null;
  website?: string | null;
};

function unwrapBrandCars(
  payload: BrandCarResponse[] | OperationResult<BrandCarResponse[]>
) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapBrandCar(
  payload: BrandCarResponse | OperationResult<BrandCarResponse>
) {
  return "data" in payload && payload.data ? payload.data : (payload as BrandCarResponse);
}

function toBrandFormData(data: BrandCarPayload) {
  const form = new FormData();
  form.append("BrandCode", data.brandCode);
  form.append("BrandName", data.brandName);
  form.append("Description", data.description ?? "");
  form.append("CountryOrigin", data.countryOrigin ?? "");
  form.append("Website", data.website ?? "");
  if (data.logo instanceof File) form.append("Logo", data.logo);
  if (typeof data.logoPath === "string") form.append("LogoPath", data.logoPath);
  return form;
}

export const brandCarRouteFn = {
  getBrandsCars: async () => {
    const response = await apiClient.get<
      BrandCarResponse[] | OperationResult<BrandCarResponse[]>
    >(
      brandCarRoute.getBrandsCars
    );
    return unwrapBrandCars(response.data);
  },
  createBrandCar: async (data: BrandCarPayload) => {
    const response = await apiClient.post<
      BrandCarResponse | OperationResult<BrandCarResponse>
    >(brandCarRoute.createBrandCar, toBrandFormData(data));
    return unwrapBrandCar(response.data);
  },
  updateBrandCar: async (brandCode: string, data: BrandCarPayload) => {
    const response = await apiClient.put<
      BrandCarResponse | OperationResult<BrandCarResponse>
    >(brandCarRoute.updateBrandCar(brandCode), toBrandFormData(data));
    return unwrapBrandCar(response.data);
  },
};

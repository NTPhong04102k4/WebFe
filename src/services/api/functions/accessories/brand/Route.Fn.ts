import apiClient from "src/services/api";
import { brandRoute } from "./Route";
import {
  BrandRequestCreate,
  BrandRequestUpdate,
} from "src/shared/types/Request/accessories/brand";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import type { OperationResult } from "src/services/types/common.types";

function toFormDataBrand(
  data: BrandRequestCreate | BrandRequestUpdate
): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  });
  return form;
}

function unwrapBrandAccessories(
  payload: BrandAccessoryResponse[] | OperationResult<BrandAccessoryResponse[]>
) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function unwrapBrandAccessory(
  payload: BrandAccessoryResponse | OperationResult<BrandAccessoryResponse>
) {
  return "data" in payload && payload.data ? payload.data : (payload as BrandAccessoryResponse);
}

export const brandRouteFn = {
  getBrands: async () => {
    const response = await apiClient.get<
      BrandAccessoryResponse[] | OperationResult<BrandAccessoryResponse[]>
    >(
      brandRoute.getBrands
    );
    return unwrapBrandAccessories(response.data);
  },
  createBrand: async (data: BrandRequestCreate) => {
    const form = toFormDataBrand(data);
    const response = await apiClient.post<
      BrandAccessoryResponse | OperationResult<BrandAccessoryResponse>
    >(
      brandRoute.createBrand,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return unwrapBrandAccessory(response.data);
  },
  updateBrand: async (data: BrandRequestUpdate) => {
    const form = toFormDataBrand(data);
    const response = await apiClient.put<
      BrandAccessoryResponse | OperationResult<BrandAccessoryResponse>
    >(
      brandRoute.updateBrand(data.name),
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return unwrapBrandAccessory(response.data);
  },
};

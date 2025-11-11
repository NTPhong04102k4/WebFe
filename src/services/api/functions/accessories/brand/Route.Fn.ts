import apiClient from "src/services/api";
import { brandRoute } from "./Route";
import {
  BrandRequestCreate,
  BrandRequestUpdate,
} from "src/shared/types/Request/accessories/brand";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
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
export const brandRouteFn = {
  getBrands: async () => {
    const response = await apiClient.get<BrandAccessoryResponse[]>(
      brandRoute.getBrands
    );
    return response.data;
  },
  createBrand: async (data: BrandRequestCreate) => {
    const form = toFormDataBrand(data);
    const response = await apiClient.post<BrandAccessoryResponse>(
      brandRoute.createBrand,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
  updateBrand: async (data: BrandRequestUpdate) => {
    const form = toFormDataBrand(data);
    const response = await apiClient.put<BrandAccessoryResponse>(
      brandRoute.updateBrand,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};

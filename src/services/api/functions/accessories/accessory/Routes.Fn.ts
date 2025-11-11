import apiClient from "src/services/api";
import { accessoryRoute } from "./Routes";
import {
  AccessoryPagingRequest,
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import {
  AccessoryDetailResponse,
  AccessoriesListItem,
  AccessoryListResponse,
} from "src/shared/types/Reponse/accessories/accessory";

function toFormData(
  data: AccessoryRequestCreate | AccessoryRequestUpdate
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

export const accessoryRouteFn = {
  getDetail: async (accessoryId: number) => {
    const response = await apiClient.get<AccessoryDetailResponse>(
      `${accessoryRoute.detail}`,
      { params: { accessoryId } }
    );
    return response.data;
  },

  getAll: async () => {
    // Fetch a large page to simulate "all" for client-side filtering
    const response = await apiClient.get<AccessoryListResponse>(
      accessoryRoute.list,
      {
        params: { Page: 1, PageSize: 1000 },
      }
    );
    return response.data;
  },

  getPaged: async (params: AccessoryPagingRequest) => {
    const response = await apiClient.get<AccessoryListResponse>(
      accessoryRoute.list,
      {
        params: {
          Page: params.page ?? 1,
          PageSize: params.pageSize ?? 10,
          PriceFrom: params.priceFrom ?? undefined,
          PriceTo: params.priceTo ?? undefined,
          CategoryID: params.categoryID ?? undefined,
          BrandAccessoryID: params.brandAccessoryID ?? undefined,
          SortBy: params.sortBy ?? undefined,
          SortDescending: params.sortDescending ?? false,
        },
      }
    );
    return response.data;
  },

  create: async (data: AccessoryRequestCreate) => {
    const form = toFormData(data);
    const response = await apiClient.post<AccessoryDetailResponse>(
      accessoryRoute.create,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  update: async (id: number | string, data: AccessoryRequestUpdate) => {
    const form = toFormData(data);
    const response = await apiClient.put<AccessoryDetailResponse>(
      accessoryRoute.update,
      form,
      {
        params: { id },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};

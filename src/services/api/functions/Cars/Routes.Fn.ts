import { CarDetailResponse, CarResponse } from "src/shared/types/Reponse/Car";
import apiClient from "../..";
import { carRoute } from "./Routes";
import {
  CarDetailUpdateRequest,
  CarPagingRequest,
  TechSpecDetailUpdateRequest,
} from "src/shared/types/Request/Car";

export const carRouteFn = {
  getDetail: async (id: number) => {
    const response = await apiClient.get<CarDetailResponse>(carRoute.detail, {
      params: { id },
    });
    return response.data;
  },
  getPaging: async (params: CarPagingRequest) => {
    // Use POST method as the API requires POST for paging requests
    const response = await apiClient.post<CarResponse>(carRoute.paging, {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      BrandCode: params.brandCode ?? "",
      BodyCode: params.bodyCode ?? "",
      PriceFrom: params.PriceFrom ?? undefined,
      PriceTo: params.PriceTo ?? undefined,
    });
    return response.data;
  },
  create: async (data: CarDetailUpdateRequest) => {
    // For FormData with files, we need to increase timeout and allow larger payloads
    try {
      // Log FormData info for debugging
      if (data instanceof FormData) {
        const formDataKeys = Array.from(data.keys());
        console.log("📤 Sending FormData with fields:", formDataKeys);
        console.log("📤 FormData entries count:", formDataKeys.length);

        // Log file info
        const fileEntries: string[] = [];
        formDataKeys.forEach((key) => {
          const value = data.get(key);
          if (value instanceof File) {
            fileEntries.push(
              `${key}: ${value.name} (${value.size} bytes, ${value.type})`
            );
          }
        });
        if (fileEntries.length > 0) {
          console.log("📤 Files in FormData:", fileEntries);
        }
      }

      console.log("📤 Making POST request to:", carRoute.create);
      const startTime = Date.now();

      const response = await apiClient.post<CarDetailResponse>(
        carRoute.create,
        data
      );

      const duration = Date.now() - startTime;
      console.log("✅ Request successful in", duration, "ms");
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error("❌ Request failed:", {
        message: error.message,
        code: error.code,
        name: error.name,
        url: carRoute.create,
        isFormData: data instanceof FormData,
        hasResponse: !!error.response,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });

      if (error.code === "ERR_NETWORK" || !error.response) {
        // Network error - request didn't reach server
        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout")
        ) {
          throw new Error(
            "Lỗi timeout: Request mất quá nhiều thời gian. Vui lòng thử lại hoặc giảm kích thước file."
          );
        }
        throw new Error(
          "Lỗi kết nối: Không thể kết nối đến server.\n" +
            "Có thể do:\n" +
            "- CORS policy chặn request\n" +
            "- Server không phản hồi\n" +
            "- Mạng không ổn định\n" +
            "- Firewall chặn request\n\n" +
            "Vui lòng kiểm tra Network tab trong DevTools để xem chi tiết."
        );
      }

      // Log server error details
      if (error.response) {
        console.error("Server Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      throw error;
    }
  },
  update: async (id: number, data: CarDetailUpdateRequest) => {
    const response = await apiClient.put<CarDetailResponse>(
      carRoute.edit,
      data,
      {
        params: { id },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
  createTechSpec: async (id: number, data: TechSpecDetailUpdateRequest) => {
    const response = await apiClient.post<CarDetailResponse>(
      carRoute.techSpecCreate,
      data,
      {
        params: { id },
      }
    );
    return response.data;
  },
  updateTechSpec: async (id: number, data: TechSpecDetailUpdateRequest) => {
    const response = await apiClient.put<CarDetailResponse>(
      carRoute.techSpecEdit,
      data,
      {
        params: { id },
      }
    );
    return response.data;
  },
};

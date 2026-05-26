import { CarDetailResponse, CarResponse } from "src/shared/types/Reponse/Car";
import type { OperationResult, PagedResponse } from "src/services/types/common.types";
import apiClient from "../..";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import { carRoute } from "./Routes";
import { logger } from "@/common/utils/logger";
import { storage } from "src/services/storage";
import {
  CarMutationPayload,
  CarPagingRequest,
  TechSpecDetailUpdateRequest,
} from "src/shared/types/Request/Car";

export const carRouteFn = {
  getDetail: async (id: number, options?: ApiRequestOptions) => {
    const response = await apiClient.get<CarDetailResponse>(
      carRoute.detail(id),
      withSignal({}, options)
    );
    return response.data;
  },
  getTechSpec: async (id: number, options?: ApiRequestOptions) => {
    const response = await apiClient.get<{ success: boolean; data: CarDetailResponse }>(
      carRoute.techSpecGet(id),
      withSignal({}, options)
    );
    return response.data.data;
  },
  getPaging: async (params: CarPagingRequest, options?: ApiRequestOptions) => {
    const response = await apiClient.get<OperationResult<PagedResponse<CarResponse["data"][number]>>>(
      carRoute.paging,
      withSignal(
        {
          params: {
            pageIndex: params.pageIndex ?? 1,
            pageSize: params.pageSize ?? 10,
            search: params.search?.trim() || undefined,
            carName: params.carName?.trim() || undefined,
            brandCode: params.brandCode || undefined,
            bodyCode: params.bodyCode || undefined,
            priceFrom: params.priceFrom ?? undefined,
            priceTo: params.priceTo ?? undefined,
          },
        },
        options
      )
    );
    const page = response.data.data ?? { data: [], totalCount: 0 };
    return {
      data: page.data,
      totalCount: page.totalCount,
    };
  },
  create: async (data: CarMutationPayload, options?: ApiRequestOptions) => {
    try {
      if (data instanceof FormData) {
        const formDataKeys = Array.from(data.keys());
        logger.log("📤 Sending FormData with fields:", formDataKeys);
        logger.log("📤 FormData entries count:", formDataKeys.length);

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
          logger.log("📤 Files in FormData:", fileEntries);
        }
      }

      logger.log("📤 Making POST request to:", carRoute.create);
      const startTime = Date.now();

      const response = await apiClient.post<CarDetailResponse>(
        carRoute.create,
        data,
        withSignal(
          data instanceof FormData ? { timeout: 120000 } : {},
          options
        )
      );

      const duration = Date.now() - startTime;
      logger.log("✅ Request successful in", duration, "ms");
      return response.data;
    } catch (error: any) {
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
  update: async (
    id: number,
    data: CarMutationPayload,
    options?: ApiRequestOptions
  ) => {
    const response = await apiClient.put<CarDetailResponse>(
      carRoute.edit,
      data,
      withSignal(
        {
          params: { id },
          headers: { "Content-Type": "multipart/form-data" },
        },
        options
      )
    );
    return response.data;
  },
  createTechSpec: async (
    id: number,
    data: TechSpecDetailUpdateRequest,
    options?: ApiRequestOptions
  ) => {
    const token = storage.getToken();
    logger.log("🔑 Token exists:", !!token);
    logger.log("📤 Creating tech spec for car ID:", id);
    logger.log("📤 Input data:", JSON.stringify(data, null, 2));

    const requestData: TechSpecDetailUpdateRequest = {
      ...data,
      carID: id,
    };

    logger.log(
      "📤 Request data (before send):",
      JSON.stringify(requestData, null, 2)
    );
    logger.log("📤 Request URL:", carRoute.techSpecCreate);

    try {
      const response = await apiClient.post<CarDetailResponse>(
        carRoute.techSpecCreate,
        requestData,
        withSignal({}, options)
      );
      logger.log("✅ Tech spec created successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating tech spec:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        message: error.message,
        url: carRoute.techSpecCreate,
        requestData: JSON.stringify(requestData, null, 2),
      });

      if (error.response?.data) {
        console.error("❌ Server error details:", error.response.data);
      }

      throw error;
    }
  },
  delete: async (id: number, options?: ApiRequestOptions) => {
    const response = await apiClient.delete<OperationResult>(
      carRoute.delete(id),
      withSignal({}, options)
    );
    return response.data;
  },
  updateTechSpec: async (
    id: number,
    data: TechSpecDetailUpdateRequest,
    options?: ApiRequestOptions
  ) => {
    const token = storage.getToken();
    logger.log("🔑 Token exists:", !!token);
    logger.log("📤 Updating tech spec for car ID:", id);

    const requestData = {
      ...data,
      carID: id,
    };

    logger.log("📤 Request data:", requestData);
    logger.log("📤 Request URL:", carRoute.techSpecEdit);

    try {
      const response = await apiClient.patch<CarDetailResponse>(
        carRoute.techSpecEdit,
        requestData,
        withSignal({ params: { id } }, options)
      );
      logger.log("✅ Tech spec updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error updating tech spec:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: carRoute.techSpecEdit,
        requestData: requestData,
      });
      throw error;
    }
  },
};

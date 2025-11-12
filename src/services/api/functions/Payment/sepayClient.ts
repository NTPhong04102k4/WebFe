import apiClient from "../..";
import { SePayOrderDetailResponse } from "src/shared/types/Reponse/Payment";

/**
 * SePay API Client
 * Proxy calls through backend to avoid Cloudflare blocking
 */
export const sepayAPI = {
  /**
   * Lấy chi tiết đơn hàng từ SePay
   * @param orderId - ID đơn hàng SePay (Ví dụ: SEPAY-68BA83CE637C1)
   */
  getOrderDetail: async (
    orderId: string
  ): Promise<SePayOrderDetailResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: SePayOrderDetailResponse;
        error?: string;
      }>(`/payment/sepay/order/${orderId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.error || "Không thể lấy thông tin đơn hàng từ SePay"
        );
      }
    } catch (error: any) {
      console.error("SePay API Error:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        error.message ||
          "Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau."
      );
    }
  },
};

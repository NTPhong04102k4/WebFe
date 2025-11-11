import axios, { AxiosInstance, AxiosResponse } from "axios";

import { ENV } from "../../config/environment";

const API_BASE_URL = ENV.API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type header to let axios set it with boundary
    // This prevents CORS issues and ensures proper multipart/form-data encoding
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) hoặc 400 (Bad Request) do token không hợp lệ
    if (error.response) {
      const status = error.response.status;

      // Nếu token không hợp lệ hoặc đã hết hạn, xóa token và redirect về login
      if (
        status === 401 ||
        (status === 400 &&
          error.response.data?.message?.toLowerCase().includes("token"))
      ) {
        // Chỉ redirect nếu không phải đang ở trang login
        if (
          window.location.pathname !== "/auth/login" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

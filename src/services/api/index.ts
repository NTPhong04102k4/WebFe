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
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Adding Authorization header to request:", config.url);
      }
    } else {
      console.warn(
        "⚠️ No auth token found in localStorage for request:",
        config.url
      );
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

      // Nếu token không hợp lệ hoặc đã hết hạn, dispatch event để component handle redirect
      // This prevents page reload by using React Router navigation instead
      if (
        status === 401 ||
        (status === 400 &&
          error.response.data?.message?.toLowerCase().includes("token"))
      ) {
        // Only trigger redirect event if not already on login page
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/auth/login" &&
          currentPath !== "/login" &&
          currentPath !== "/auth/signin" &&
          currentPath !== "/auth/signUp"
        ) {
          // Dispatch custom event for navigation handling
          // Components listening to this event can use React Router navigate
          window.dispatchEvent(
            new CustomEvent("auth:unauthorized", {
              detail: { status, path: currentPath },
            })
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

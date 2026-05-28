import axios, { AxiosInstance, AxiosResponse } from "axios";

import { ENV } from "../../config/environment";
import { logger } from "@/common/utils/logger";
import { useAuthStore } from "@/stores/authStore";
import { isTokenExpired } from "@/services/decode";
import { notify } from "@/components/core/Feedback/toast";

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
    // Đọc token từ Zustand store — single source of truth
    // (Zustand persist lưu vào localStorage key "soldcars-auth")
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.log("🔐 Bearer token attached:", config.url);
    } else {
      logger.warn("⚠️ No auth token in store for:", config.url);
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const d = response.data;
    if (d && typeof d === "object") {
      if (d.success === true && d.message) {
        notify.info(d.message);
      }
      // HTTP 200 nhưng business logic thất bại → show error + reject để mutation.onError biết
      if (d.success === false && d.message) {
        notify.error(d.message);
        return Promise.reject(new Error(d.message));
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      const errData = error.response.data;
      const serverMessage =
        errData && typeof errData === "object" && errData.success === false
          ? (errData.message as string | undefined)
          : undefined;

      if (status === 401) {
        const token = useAuthStore.getState().accessToken;
        const shouldLogout = !token || isTokenExpired(token);
        if (shouldLogout) {
          const currentPath = window.location.pathname;
          if (
            currentPath !== "/auth/login" &&
            currentPath !== "/login" &&
            currentPath !== "/auth/signin" &&
            currentPath !== "/auth/signUp"
          ) {
            window.dispatchEvent(
              new CustomEvent("auth:unauthorized", {
                detail: { status, path: currentPath },
              }),
            );
          }
        } else if (serverMessage) {
          // Token còn hạn nhưng 401 → permission denied từ business logic → show message
          notify.error(serverMessage);
        }
      } else if (serverMessage) {
        notify.error(serverMessage);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

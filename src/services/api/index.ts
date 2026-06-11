import axios, { AxiosInstance, AxiosResponse } from "axios";

import { ENV } from "../../config/environment";
import { logger } from "@/common/utils/logger";
import { useAuthStore } from "@/stores/authStore";
import { isTokenExpired } from "@/services/decode";
import { notify } from "@/components/core/Feedback/toast";
import { registerAuthHeaderCleanup } from "@/services/api/authSession";

const API_BASE_URL = ENV.API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // ASP.NET Core array model binding expects repeated keys (key=1&key=2),
  // not axios's "key[]=1&key[]=2" format (indexes: null -> repeated keys).
  paramsSerializer: { indexes: null },
});

registerAuthHeaderCleanup(() => {
  delete apiClient.defaults.headers.common.Authorization;
  delete apiClient.defaults.headers.common.authorization;
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.log("Bearer token attached:", config.url);
    } else {
      delete config.headers.Authorization;
      delete config.headers.authorization;
      logger.warn("No auth token in store for:", config.url);
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
      // suppressErrorHandling: true → caller handles success/error branching manually
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suppress = (response.config as any).suppressErrorHandling === true;
      if (!suppress && d.success === false && d.message) {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suppress = (error.config as any)?.suppressErrorHandling === true;
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
        } else if (serverMessage && !suppress) {
          notify.error(serverMessage);
        }
      } else if (serverMessage && !suppress) {
        notify.error(serverMessage);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

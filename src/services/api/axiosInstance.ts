import axios from "axios";

import { useAuthStore } from "@/stores/authStore";
import { isTokenExpired } from "@/services/decode";
import { notify } from "@/components/core/Feedback/toast";
import {
  registerAuthHeaderCleanup,
  setGlobalAuthHeader,
} from "@/services/api/authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://web-7012.onrender.com",
  timeout: 30000,
});

registerAuthHeaderCleanup(() => {
  delete api.defaults.headers.common.Authorization;
  delete api.defaults.headers.common.authorization;
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const d = res.data;
    if (d && typeof d === "object" && d.success === true && d.message) {
      notify.info(d.message);
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const currentPath = window.location.pathname;
      try {
        const accessToken = useAuthStore.getState().accessToken;
        const refreshToken = useAuthStore.getState().refreshToken;

        // Token còn hạn nhưng endpoint từ chối (thiếu claim / permissions) — không refresh
        if (accessToken && !isTokenExpired(accessToken)) {
          return Promise.reject(error);
        }

        if (!refreshToken) {
          if (accessToken && isTokenExpired(accessToken)) {
            throw new Error("Expired access token");
          }
          return Promise.reject(error);
        }
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? "https://web-7012.onrender.com"}/auth/refresh-token`,
          { refreshToken },
        );
        useAuthStore
          .getState()
          .setTokens(data.access_token, data.refresh_token);
        setGlobalAuthHeader(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", { detail: { path: currentPath } })
        );
        return Promise.reject(error);
      }
    }
    const suppressToast = (error.config as { suppressErrorToast?: boolean })?.suppressErrorToast;
    const errData = error.response?.data;
    if (
      !suppressToast &&
      errData &&
      typeof errData === "object" &&
      errData.success === false &&
      errData.message &&
      error.response?.status !== 401
    ) {
      notify.error(errData.message);
    }
    return Promise.reject(error);
  },
);

export default api;

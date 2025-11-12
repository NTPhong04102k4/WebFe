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
    if (error.response) {
      const status = error.response.status;

      if (
        status === 401 ||
        (status === 400 &&
          error.response.data?.message?.toLowerCase().includes("token"))
      ) {
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
            })
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

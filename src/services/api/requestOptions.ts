import type { AxiosRequestConfig } from "axios";

/** Passed from React Query `queryFn` / `mutationFn` (`signal`) or manual abort. */
export type ApiRequestOptions = {
  signal?: AbortSignal;
};

export function withSignal<T extends AxiosRequestConfig>(
  config: T = {} as T,
  options?: ApiRequestOptions
): T {
  if (!options?.signal) {
    return config;
  }
  return { ...config, signal: options.signal };
}

import axios from "axios";

const AUTH_STORAGE_KEYS = ["soldcars-auth", "auth_token", "auth_user"];

type HeaderCleanup = () => void;

const instanceHeaderCleanups = new Set<HeaderCleanup>();

function removeAuthorizationHeader(headers: { Authorization?: unknown; authorization?: unknown }) {
  delete headers.Authorization;
  delete headers.authorization;
}

export function registerAuthHeaderCleanup(cleanup: HeaderCleanup) {
  instanceHeaderCleanups.add(cleanup);
  return () => instanceHeaderCleanups.delete(cleanup);
}

export function setGlobalAuthHeader(accessToken: string) {
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export function clearAuthHeaders() {
  removeAuthorizationHeader(axios.defaults.headers.common);
  instanceHeaderCleanups.forEach((cleanup) => cleanup());
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

async function clearBrowserCacheStorage() {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const keys = await window.caches.keys();
  await Promise.all(keys.map((key) => window.caches.delete(key)));
}

export function clearAuthSessionSideEffects() {
  clearAuthHeaders();
  clearAuthStorage();
  void clearBrowserCacheStorage().catch(() => undefined);
}

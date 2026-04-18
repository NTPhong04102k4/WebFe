const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export const storage = {
  getToken(): string | null {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  },

  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getUser<T = unknown>(): T | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw || raw === "undefined" || raw === "null") return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUser(user: unknown): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  get(key: string): string | null {
    return localStorage.getItem(key);
  },

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

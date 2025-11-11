import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  RegisterVerifyResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

const getStoredUser = (): any | null => {
  try {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser || storedUser === "undefined" || storedUser === "null") {
      return null;
    }
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("auth_token");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
};

const initialState: AuthState = {
  token: getStoredToken(),
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: UserResponse | RegisterVerifyResponse["data"]["user"] | null;
        isAuthenticated?: boolean;
      }>
    ) => {
      // Create new object references to ensure React re-renders
      state.token = action.payload.token;
      // Always create a new user object reference, even if values are the same
      state.user = action.payload.user ? { ...action.payload.user } : null;
      // Calculate isAuthenticated from token if not provided, or use provided value
      state.isAuthenticated =
        action.payload.isAuthenticated !== undefined
          ? action.payload.isAuthenticated
          : !!action.payload.token;

      // Save to localStorage
      if (action.payload.token) {
        localStorage.setItem("auth_token", action.payload.token);
      } else {
        localStorage.removeItem("auth_token");
      }

      if (action.payload.user) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem("auth_user");
      }

      // Debug log
      console.log("🔄 Redux - setCredentials called:", {
        hasToken: !!state.token,
        hasUser: !!state.user,
        isAuthenticated: state.isAuthenticated,
        userName: state.user?.fullName || state.user?.username || "No user",
      });
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export default authSlice.reducer;

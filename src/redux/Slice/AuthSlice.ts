import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  RegisterVerifyResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";
import { storage } from "src/services/storage";

type AuthUser =
  | UserResponse
  | RegisterVerifyResponse["data"]["user"]
  | null;

interface AuthState {
  token: string | null;
  user: AuthUser;
  isAuthenticated: boolean;
}

const getStoredUser = (): AuthUser => storage.getUser<AuthUser>();

const getStoredToken = (): string | null => storage.getToken();

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
      state.token = action.payload.token;
      state.user = action.payload.user ? { ...action.payload.user } : null;
      state.isAuthenticated =
        action.payload.isAuthenticated !== undefined
          ? action.payload.isAuthenticated
          : !!action.payload.token;

      if (action.payload.token) {
        storage.setToken(action.payload.token);
      } else {
        storage.removeToken();
      }

      if (action.payload.user) {
        storage.setUser(action.payload.user);
      } else {
        storage.removeUser();
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      storage.removeToken();
      storage.removeUser();
    },
  },
});

export type { AuthUser };
export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export default authSlice.reducer;

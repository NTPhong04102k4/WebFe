import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  RegisterVerifyResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user/input";

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("auth_token"),
  user: JSON.parse(localStorage.getItem("auth_user") || "null"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
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
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;

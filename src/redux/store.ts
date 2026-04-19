import { configureStore } from "@reduxjs/toolkit";

import { authSlice } from "./Slice/AuthSlice";
import { authGuardMiddleware } from "./middleware/authGuardMiddleware";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authGuardMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

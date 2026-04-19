import { isAction, type Middleware } from "@reduxjs/toolkit";

import { ENV } from "src/config/environment";
import { getRolesFromToken, isTokenExpired } from "src/services/decode";
import { logger } from "src/utils/logger";

import type { AuthGuardMeta } from "../actionMeta";
import type { RootState } from "../store";

function getGuard(action: unknown): AuthGuardMeta["guard"] | undefined {
  if (!isAction(action) || typeof action !== "object") {
    return undefined;
  }
  const meta = (action as { meta?: AuthGuardMeta }).meta;
  return meta?.guard;
}

/**
 * Chặn action có `meta.guard` khi chưa đăng nhập, token hết hạn, hoặc không có role phù hợp.
 * Action không có `meta.guard` đi qua bình thường.
 */
export const authGuardMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action: unknown) => {
    const guard = getGuard(action);
    if (!guard) {
      return next(action);
    }

    const state = store.getState();
    const token = state.auth.token;

    if (guard.requireAuth) {
      if (!token || isTokenExpired(token)) {
        if (ENV.IS_DEVELOPMENT) {
          logger.warn("[authGuard] Blocked (auth required):", action);
        }
        return;
      }
    }

    if (guard.roles?.length) {
      const roles = getRolesFromToken(token);
      const allowed = guard.roles.some((r) => roles.includes(r));
      if (!allowed) {
        if (ENV.IS_DEVELOPMENT) {
          logger.warn("[authGuard] Blocked (role):", action, {
            need: guard.roles,
            have: roles,
          });
        }
        return;
      }
    }

    return next(action);
  };

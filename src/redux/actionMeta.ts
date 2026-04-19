/**
 * Gắn vào action qua `meta.guard` (Redux middleware sẽ chặn nếu không đủ điều kiện).
 *
 * @example
 * dispatch({
 *   type: "admin/openSensitivePanel",
 *   payload: undefined,
 *   meta: { guard: { requireAuth: true, roles: ["Admin", "SuperAdmin"] } },
 * });
 */
export type AuthGuardMeta = {
  guard?: {
    requireAuth?: boolean;
    /** Một trong các role (JWT) là đủ */
    roles?: string[];
  };
};

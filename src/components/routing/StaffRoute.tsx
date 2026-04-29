import React from "react";
import { Navigate } from "react-router-dom";

import { getRolesFromToken, isTokenExpired } from "src/services/decode";
import { canAccessStaffBackend } from "@/common/utils/roles";
import { useAuthStore } from "@/stores/authStore";

type Props = { children: React.ReactNode };

/**
 * Chỉ Admin / SuperAdmin / Staff. Role Technician (thợ) không vào được khu vực quản trị.
 */
export function StaffRoute({ children }: Props) {
  const token = useAuthStore((s) => s.accessToken);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/auth/login" replace />;
  }

  const roles = getRolesFromToken(token);
  if (!canAccessStaffBackend(roles)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

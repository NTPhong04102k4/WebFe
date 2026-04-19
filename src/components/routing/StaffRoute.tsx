import React from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "src/redux/hook";
import { selectIsAuthenticated, selectToken } from "src/redux/Slice/AuthSlice";
import { getRolesFromToken, isTokenExpired } from "src/services/decode";
import { canAccessStaffBackend } from "src/utils/roles";

type Props = { children: React.ReactNode };

/**
 * Chỉ Admin / SuperAdmin / Staff. Role Technician (thợ) không vào được khu vực quản trị.
 */
export function StaffRoute({ children }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);

  if (!isAuthenticated || !token || isTokenExpired(token)) {
    return <Navigate to="/auth/login" replace />;
  }

  const roles = getRolesFromToken(token);
  if (!canAccessStaffBackend(roles)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

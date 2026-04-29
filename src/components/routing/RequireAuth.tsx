import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "src/redux/hook";
import { selectIsAuthenticated } from "src/redux/Slice/AuthSlice";

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}

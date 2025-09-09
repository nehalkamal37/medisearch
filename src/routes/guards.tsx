// src/routes/guards.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { all_routes } from "./all_routes";

export const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    const login = all_routes.login || "/login";
    const fallback = all_routes.home || "/home";
    return <Navigate to={login || fallback} replace />;
  }
  return <>{children}</>;
};

export const RequireGuest: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    const dest = all_routes.dashboards || all_routes.home || "/";
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
};

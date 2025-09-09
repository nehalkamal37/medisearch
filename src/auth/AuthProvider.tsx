// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAccessToken, isTokenValid } from "../utils/auth";

type AuthState = {
  initializing: boolean;
  isAuthenticated: boolean;
};

const AuthCtx = createContext<AuthState>({ initializing: false, isAuthenticated: false });

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isTokenValid(getAccessToken())
  );

  // Keep auth state in sync with storage changes (logout in other tabs, etc.)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        setIsAuthenticated(isTokenValid(getAccessToken()));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ initializing: false, isAuthenticated }),
    [isAuthenticated]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);

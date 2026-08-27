"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { clearToken, endImpersonation, getToken, isImpersonating, setToken } from "./token-storage";
import type { CurrentUser, LoginResponse } from "./types";

interface AuthContextValue {
  user: CurrentUser | null;
  /** True while the initial /auth/me check (on page load, from a stored token) is in flight. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.get<CurrentUser>("/auth/me");
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && isImpersonating()) {
        // A revoked/expired impersonation session 401s (see TenantContextMiddleware) before the
        // token's own exp — drop back to the real super-admin session instead of a full logout,
        // and retry once so the caller ends up authenticated as the real super admin again.
        endImpersonation();
        try {
          const me = await api.get<CurrentUser>("/auth/me");
          setUser(me);
          setIsLoading(false);
          return;
        } catch {
          clearToken();
          setUser(null);
        }
      } else {
        if (err instanceof ApiError && err.status === 401) clearToken();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() muss innerhalb von <AuthProvider> verwendet werden.");
  return ctx;
}

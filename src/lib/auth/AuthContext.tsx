"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { clearToken, endImpersonation, getToken, isImpersonating, setToken, TOKEN_STORAGE_KEYS } from "./token-storage";
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

  useEffect(() => {
    // Fixed 2026-08-29 (SEC-06, docs/audit/04-security-authz.md): localStorage is shared across
    // every tab of the same origin, but each tab's `user` here is plain React state loaded once on
    // mount — starting/ending an impersonation in one tab silently swapped the active token
    // underneath every other open tab without updating what they displayed, so a second tab could
    // keep showing (and acting as) the old identity while its outgoing requests were already using
    // the new one. The native `storage` event only fires in *other* tabs than the one that wrote
    // the change, which is exactly what's needed to resync them.
    function handleStorageChange(event: StorageEvent) {
      if (event.key !== null && !TOKEN_STORAGE_KEYS.includes(event.key)) return;
      void loadCurrentUser();
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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

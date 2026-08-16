"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { Rolle } from "./types";

/** Wraps an area layout (admin/kitchen/portal/driver/super-admin) — redirects to /login when
 * there's no authenticated user, or the user's role isn't allowed in this area. Renders nothing
 * while the initial /auth/me check is in flight or a redirect is about to happen, so protected
 * pages never flash their content to an unauthorized visitor. */
export function RequireRole({ roles, children }: { roles: Rolle[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const authorized = !!user && roles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!authorized) router.replace("/login");
  }, [isLoading, authorized, router]);

  if (isLoading || !authorized) return null;
  return <>{children}</>;
}

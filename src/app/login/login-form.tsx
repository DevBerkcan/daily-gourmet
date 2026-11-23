"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/I18nContext";
import type { Rolle } from "@/lib/auth/types";

const landingByRole: Record<Rolle, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  TENANT_OWNER: "/admin/dashboard",
  TENANT_ADMIN: "/admin/dashboard",
  FACILITY_ADMIN: "/portal/dashboard",
  FACILITY_USER: "/portal/dashboard",
  DRIVER: "/driver",
  READ_ONLY: "/admin/dashboard",
};

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(loginUsername: string, loginPassword: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(loginUsername, loginPassword);
      router.push(landingByRole[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("login.failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="font-display text-2xl font-semibold text-ink">{t("login.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("login.subtitle")}</p>
      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin(username, password);
        }}
      >
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-ink">{t("login.email")}</label>
          <input
            id="username" type="text" autoComplete="username" placeholder="benutzername"
            value={username} onChange={(e) => setUsername(e.target.value)} required
            className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
          />
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <label htmlFor="password" className="text-sm font-medium text-ink">{t("login.password")}</label>
            <span className="cursor-pointer text-xs font-medium text-basil hover:underline">{t("login.forgotPassword")}</span>
          </div>
          <input
            id="password" type="password" autoComplete="current-password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required
            className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit" disabled={isSubmitting}
          className="min-h-11 cursor-pointer rounded-lg bg-basil text-sm font-semibold text-white transition-colors hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </button>
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, School, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
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

/** Seeded dev accounts (see Data/DbSeeder.cs) — convenient one-click logins during local
 * development. All seeded accounts share the same dev password. */
const devAccounts = [
  { email: "miriam.hoffmann@daily-gourmet.de", icon: ChefHat, label: "Tenant Owner", hint: "Daily Gourmet · Verwaltung" },
  { email: "markus.becker@daily-gourmet.de", icon: Truck, label: "Fahrer", hint: "Daily Gourmet · Auslieferung" },
  { email: "claudia.winter@musterschule-nord.example.de", icon: School, label: "Einrichtung", hint: "Musterschule Nord · Kundenportal" },
];
const DEV_PASSWORD = "Passwort123!";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(loginEmail, loginPassword);
      router.push(landingByRole[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin(email, password);
        }}
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">E-Mail-Adresse</label>
          <input
            id="email" type="email" autoComplete="email" placeholder="name@unternehmen.de"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-ink">Passwort</label>
            <span className="cursor-pointer text-xs font-medium text-basil hover:underline">Passwort vergessen?</span>
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
          className="min-h-11 cursor-pointer rounded-lg bg-basil text-sm font-semibold text-white transition-colors hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:opacity-60"
        >
          {isSubmitting ? "Anmeldung läuft …" : "Anmelden"}
        </button>
      </form>

      <div className="mt-9">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Demo-Zugänge (Entwicklung)</p>
        <div className="mt-3 grid gap-2">
          {devAccounts.map((account) => (
            <button
              key={account.email} type="button" disabled={isSubmitting}
              onClick={() => void handleLogin(account.email, DEV_PASSWORD)}
              className="group flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-basil hover:bg-basil-soft disabled:opacity-60"
            >
              <account.icon size={18} className="text-basil" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-ink">{account.label}</span>
                <span className="block text-xs text-muted">{account.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

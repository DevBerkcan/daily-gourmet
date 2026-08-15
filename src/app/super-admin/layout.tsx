"use client";

import { useEffect, useState } from "react";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, Building2, Users, MapPin, Activity, ScrollText, ToggleLeft, LifeBuoy, Lock } from "lucide-react";

const nav: NavItem[] = [
  { label: "Übersicht", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Mandanten", href: "/super-admin/tenants", icon: Building2 },
  { label: "Standorte", href: "/super-admin/locations", icon: MapPin },
  { label: "Benutzer", href: "/super-admin/users", icon: Users },
  { label: "System", href: "/super-admin/system", icon: Activity },
  { label: "Audit-Log", href: "/super-admin/audit", icon: ScrollText },
  { label: "Feature-Flags", href: "/super-admin/features", icon: ToggleLeft },
  { label: "Support", href: "/super-admin/support", icon: LifeBuoy },
];

/**
 * Rein clientseitige Abschirmung für Live-Demos — kein echter Sicherheitsmechanismus
 * (jeder mit Browser-Entwicklertools kann das umgehen). Echte Zugriffskontrolle kommt
 * erst mit dem Backend-Login (Phase 2). Passphrase hier bei Bedarf ändern.
 */
const SUPERADMIN_PASSPHRASE = "gentle2026";
const SESSION_KEY = "dg_superadmin_unlocked";

function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === SUPERADMIN_PASSPHRASE) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  if (unlocked === null) return null;

  if (!unlocked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-5">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-line bg-surface p-6">
          <div className="mb-4 flex items-center gap-2 text-ink">
            <Lock size={18} className="text-basil" aria-hidden />
            <h1 className="font-display text-lg font-semibold">Super Admin</h1>
          </div>
          <p className="mb-4 text-sm text-muted">Dieser Bereich ist eingeschränkt. Bitte Passphrase eingeben.</p>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Passphrase"
            className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
          />
          {error && <p className="mt-2 text-xs text-danger">Falsche Passphrase.</p>}
          <button
            type="submit"
            className="mt-4 min-h-11 w-full cursor-pointer rounded-lg bg-basil text-sm font-semibold text-white transition-colors hover:bg-basil-deep"
          >
            Entsperren
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGate>
      <AppShell areaLabel="Plattform" areaTone="platform" nav={nav} userName="Berk-Can Aydin" userRole="Super Admin · Gentle Group">
        {children}
      </AppShell>
    </SuperAdminGate>
  );
}

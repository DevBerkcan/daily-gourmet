"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Card } from "@/components/ui";
import { LayoutDashboard, CalendarRange, ClipboardList, UserCircle } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFeatureFlagGate } from "@/lib/services/feature-flags";

const nav: NavItem[] = [
  { label: "Übersicht", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Speiseplan", href: "/portal/meal-plans", icon: CalendarRange },
  { label: "Bestellungen", href: "/portal/orders", icon: ClipboardList },
  { label: "Einrichtung", href: "/portal/profile", icon: UserCircle },
];

const roleLabels: Record<string, string> = { FACILITY_ADMIN: "Facility Admin", FACILITY_USER: "Facility User" };

function PortalShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const roleLabel = user ? roleLabels[user.role] ?? user.role : "";
  const { enabled: kundenportalAktiv, isLoading: flagLoading } = useFeatureFlagGate("kundenportal");
  return (
    <AppShell areaLabel="Kundenportal" areaTone="portal" nav={nav} userName={user?.name ?? ""} userRole={`${roleLabel}${user?.facilityName ? ` · ${user.facilityName}` : ""}`}>
      {flagLoading ? null : kundenportalAktiv ? children : (
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-ink">Kundenportal nicht verfügbar</h1>
          <p className="mt-2 text-sm text-muted">Das Kundenportal ist für Ihren Mandanten derzeit nicht aktiviert. Bitte wenden Sie sich an Ihre Verwaltung.</p>
        </Card>
      )}
    </AppShell>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["FACILITY_ADMIN", "FACILITY_USER"]}>
      <PortalShell>{children}</PortalShell>
    </RequireRole>
  );
}

"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { AlertTriangle, CalendarDays, ClipboardCheck, PackageCheck, Scale, Soup } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

const nav: NavItem[] = [
  { label: "Heutige Produktion", href: "/kitchen", icon: Soup },
  { label: "Produktionspläne", href: "/kitchen/plans", icon: CalendarDays },
  { label: "Gesamtbedarf", href: "/kitchen/requirements", icon: Scale },
  { label: "Tourbereitstellung", href: "/kitchen/packing", icon: PackageCheck },
  { label: "Kontrollen", href: "/kitchen/controls", icon: ClipboardCheck },
  { label: "Abweichungen", href: "/kitchen/deviations", icon: AlertTriangle },
];

const roleLabels: Record<string, string> = { KITCHEN_MANAGER: "Kitchen Manager", KITCHEN_STAFF: "Küchenmitarbeiter" };

function KitchenShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const roleLabel = user ? roleLabels[user.role] ?? user.role : "";
  return (
    <AppShell areaLabel="Küche" areaTone="kitchen" nav={nav} userName={user?.name ?? ""} userRole={`${roleLabel} · ${user?.tenantName ?? ""}`}>
      {children}
    </AppShell>
  );
}

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["KITCHEN_MANAGER", "KITCHEN_STAFF"]}>
      <KitchenShell>{children}</KitchenShell>
    </RequireRole>
  );
}

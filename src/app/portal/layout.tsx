"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, CalendarRange, ClipboardList, UserCircle } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

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
  return (
    <AppShell areaLabel="Kundenportal" areaTone="portal" nav={nav} userName={user?.name ?? ""} userRole={`${roleLabel}${user?.facilityName ? ` · ${user.facilityName}` : ""}`}>
      {children}
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

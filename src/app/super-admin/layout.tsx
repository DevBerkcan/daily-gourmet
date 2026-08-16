"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, Building2, Users, MapPin, Activity, ScrollText, ToggleLeft, LifeBuoy } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

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

function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <AppShell areaLabel="Plattform" areaTone="platform" nav={nav} userName={user?.name ?? ""} userRole="Super Admin · Gentle Group">
      {children}
    </AppShell>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["SUPER_ADMIN"]}>
      <SuperAdminShell>{children}</SuperAdminShell>
    </RequireRole>
  );
}

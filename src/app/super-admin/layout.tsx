"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, Building2, Users, MapPin, Activity, ScrollText, ToggleLeft, LifeBuoy } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

const nav: NavItem[] = [
  { labelKey: "nav.superAdmin.dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.superAdmin.tenants", href: "/super-admin/tenants", icon: Building2 },
  { labelKey: "nav.superAdmin.locations", href: "/super-admin/locations", icon: MapPin },
  { labelKey: "nav.superAdmin.users", href: "/super-admin/users", icon: Users },
  { labelKey: "nav.superAdmin.system", href: "/super-admin/system", icon: Activity },
  { labelKey: "nav.superAdmin.audit", href: "/super-admin/audit", icon: ScrollText },
  { labelKey: "nav.superAdmin.features", href: "/super-admin/features", icon: ToggleLeft },
  { labelKey: "nav.superAdmin.support", href: "/super-admin/support", icon: LifeBuoy },
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

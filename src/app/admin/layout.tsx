"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, School, Carrot, BookOpenText, CalendarRange, Factory, ShoppingBasket, TrendingUp, Truck, ClipboardList } from "lucide-react";
import { TenantSupportWidget } from "@/features/support/components/TenantSupportWidget";
import { SupportModeBanner } from "@/features/support/components/SupportModeBanner";
import { ImpersonationBanner } from "@/features/support/components/ImpersonationBanner";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFeatureFlag } from "@/lib/services/feature-flags";

const roleLabels: Record<string, string> = { TENANT_OWNER: "Tenant Owner", TENANT_ADMIN: "Tenant Admin" };

const baseNav: NavItem[] = [
  { label: "Übersicht", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Speisepläne", href: "/admin/meal-plans", icon: CalendarRange },
  { label: "Bestellungen", href: "/admin/orders", icon: ClipboardList },
  { label: "Rezepte", href: "/admin/recipes", icon: BookOpenText },
  { label: "Zutaten", href: "/admin/ingredients", icon: Carrot },
  { label: "Produktion", href: "/admin/production", icon: Factory },
  { label: "Lieferrouten", href: "/admin/routes", icon: Truck },
  { label: "Einkauf", href: "/admin/procurement", icon: ShoppingBasket },
  { label: "Umsatz", href: "/admin/revenue", icon: TrendingUp },
  { label: "Einrichtungen", href: "/admin/facilities", icon: School },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const roleLabel = user ? roleLabels[user.role] ?? user.role : "";
  const umsatzAktiv = useFeatureFlag("revenue-export");
  const nav = umsatzAktiv ? baseNav : baseNav.filter((item) => item.href !== "/admin/revenue");
  return (
    <AppShell areaLabel="Verwaltung" areaTone="tenant" nav={nav} userName={user?.name ?? ""} userRole={`${roleLabel} · ${user?.tenantName ?? ""}`}>
      {/* Same underlying SupportSession drives both — ImpersonationBanner for the super admin
          actively browsing as this tenant, SupportModeBanner for the tenant being supported. */}
      {user?.isImpersonation ? <ImpersonationBanner /> : <SupportModeBanner />}
      {children}
      {!user?.isImpersonation && <TenantSupportWidget />}
    </AppShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["TENANT_OWNER", "TENANT_ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}

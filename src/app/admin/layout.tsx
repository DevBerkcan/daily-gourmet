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
  { labelKey: "nav.admin.dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.admin.mealPlans", href: "/admin/meal-plans", icon: CalendarRange },
  { labelKey: "nav.admin.orders", href: "/admin/orders", icon: ClipboardList },
  { labelKey: "nav.admin.recipes", href: "/admin/recipes", icon: BookOpenText },
  { labelKey: "nav.admin.ingredients", href: "/admin/ingredients", icon: Carrot },
  { labelKey: "nav.admin.production", href: "/admin/production", icon: Factory },
  { labelKey: "nav.admin.routes", href: "/admin/routes", icon: Truck },
  { labelKey: "nav.admin.procurement", href: "/admin/procurement", icon: ShoppingBasket },
  { labelKey: "nav.admin.revenue", href: "/admin/revenue", icon: TrendingUp },
  { labelKey: "nav.admin.facilities", href: "/admin/facilities", icon: School },
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

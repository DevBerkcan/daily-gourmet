"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, Building, School, Carrot, BookOpenText, CalendarRange, Factory, ShoppingBasket, TrendingUp, Settings, Truck, ClipboardList } from "lucide-react";
import { TenantSupportWidget } from "@/features/support/components/TenantSupportWidget";
import { SupportModeBanner } from "@/features/support/components/SupportModeBanner";

const nav: NavItem[] = [
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
  { label: "Unternehmen", href: "/admin/company", icon: Building },
  { label: "Einstellungen", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell areaLabel="Verwaltung" areaTone="tenant" nav={nav} userName="Miriam Hoffmann" userRole="Tenant Owner · Daily Gourmet">
      <SupportModeBanner />
      {children}
      <TenantSupportWidget />
    </AppShell>
  );
}

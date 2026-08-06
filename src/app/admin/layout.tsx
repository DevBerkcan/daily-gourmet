"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, Building, Users, MapPin, School, Carrot, BookOpenText, CalendarRange, Factory, ShoppingBasket, Settings } from "lucide-react";

const nav: NavItem[] = [
  { label: "Übersicht", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Speisepläne", href: "/admin/meal-plans", icon: CalendarRange },
  { label: "Rezepte", href: "/admin/recipes", icon: BookOpenText },
  { label: "Zutaten", href: "/admin/ingredients", icon: Carrot },
  { label: "Produktion", href: "/admin/production", icon: Factory },
  { label: "Einkauf", href: "/admin/procurement", icon: ShoppingBasket },
  { label: "Einrichtungen", href: "/admin/facilities", icon: School },
  { label: "Standorte", href: "/admin/locations", icon: MapPin },
  { label: "Benutzer", href: "/admin/users", icon: Users },
  { label: "Unternehmen", href: "/admin/company", icon: Building },
  { label: "Einstellungen", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell areaLabel="Verwaltung" areaTone="tenant" nav={nav} userName="Miriam Hoffmann" userRole="Tenant Owner · Daily Gourmet">
      {children}
    </AppShell>
  );
}

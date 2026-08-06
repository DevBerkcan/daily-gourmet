"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { LayoutDashboard, CalendarRange, ClipboardList, UserCircle } from "lucide-react";

const nav: NavItem[] = [
  { label: "Übersicht", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Speiseplan", href: "/portal/meal-plans", icon: CalendarRange },
  { label: "Bestellungen", href: "/portal/orders", icon: ClipboardList },
  { label: "Einrichtung", href: "/portal/profile", icon: UserCircle },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell areaLabel="Kundenportal" areaTone="portal" nav={nav} userName="Claudia Winter" userRole="Facility Admin · Musterschule Nord">
      {children}
    </AppShell>
  );
}

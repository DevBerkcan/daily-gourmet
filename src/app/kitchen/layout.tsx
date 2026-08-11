"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { AlertTriangle, CalendarDays, ClipboardCheck, PackageCheck, Scale, Soup } from "lucide-react";

const nav: NavItem[] = [
  { label: "Heutige Produktion", href: "/kitchen", icon: Soup },
  { label: "Produktionspläne", href: "/kitchen/plans", icon: CalendarDays },
  { label: "Gesamtbedarf", href: "/kitchen/requirements", icon: Scale },
  { label: "Tourbereitstellung", href: "/kitchen/packing", icon: PackageCheck },
  { label: "Kontrollen", href: "/kitchen/controls", icon: ClipboardCheck },
  { label: "Abweichungen", href: "/kitchen/deviations", icon: AlertTriangle },
];

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell areaLabel="Küche" areaTone="kitchen" nav={nav} userName="Petra Salomon" userRole="Kitchen Manager · Zentralküche">
      {children}
    </AppShell>
  );
}

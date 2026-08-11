"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Route, Truck } from "lucide-react";

const nav: NavItem[] = [
  { label: "Meine heutige Route", href: "/driver", icon: Truck },
  { label: "Meine Touren", href: "/driver/routes", icon: Route },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <AppShell areaLabel="Fahrer" areaTone="driver" nav={nav} userName="Markus Becker" userRole="Fahrer · D-DG 201">{children}</AppShell>;
}

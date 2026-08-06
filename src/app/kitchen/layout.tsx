"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Soup, BookOpenText } from "lucide-react";

const nav: NavItem[] = [
  { label: "Heutige Produktion", href: "/kitchen", icon: Soup },
  { label: "Rezepte", href: "/admin/recipes", icon: BookOpenText },
];

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell areaLabel="Küche" areaTone="kitchen" nav={nav} userName="Petra Salomon" userRole="Kitchen Manager · Zentralküche">
      {children}
    </AppShell>
  );
}

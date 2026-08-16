"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Route, Truck } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

const nav: NavItem[] = [
  { label: "Meine heutige Route", href: "/driver", icon: Truck },
  { label: "Meine Touren", href: "/driver/routes", icon: Route },
];

function DriverShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <AppShell areaLabel="Fahrer" areaTone="driver" nav={nav} userName={user?.name ?? ""} userRole="Fahrer">
      {children}
    </AppShell>
  );
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["DRIVER"]}>
      <DriverShell>{children}</DriverShell>
    </RequireRole>
  );
}

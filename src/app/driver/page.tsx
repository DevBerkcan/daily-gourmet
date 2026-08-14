import { PageHeader } from "@/components/ui";
import { DriverDashboard } from "@/features/logistics/components/driver-dashboard";

export const metadata = { title: "Fahrer — Meine Route" };

export default function DriverPage() {
  return <><PageHeader title="Meine heutige Route" subtitle="Donnerstag, 06. August 2026 · Erst Ladung prüfen, dann Tour starten." /><DriverDashboard /></>;
}

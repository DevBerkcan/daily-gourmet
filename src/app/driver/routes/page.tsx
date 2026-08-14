import { PageHeader } from "@/components/ui";
import { RoutesList } from "@/features/logistics/components/routes-list";

export const metadata = { title: "Fahrer — Meine Touren" };

export default function DriverRoutesPage() {
  return <><PageHeader title="Meine Touren" subtitle="Aktuelle und geplante Auslieferungen mit Kunden, Zeitfenstern und Ladungsmengen." /><RoutesList /></>;
}

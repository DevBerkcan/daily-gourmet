import { PageHeader } from "@/components/ui";
import { RouteManager } from "@/features/logistics/components/route-manager";

export const metadata = { title: "Lieferrouten" };

export default function RoutesPage() {
  return <><PageHeader title="Lieferrouten" subtitle="Touren definieren, Fahrer und Fahrzeuge zuordnen und Kunden in Lieferreihenfolge planen." /><RouteManager /></>;
}

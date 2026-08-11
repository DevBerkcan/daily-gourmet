import { PageHeader } from "@/components/ui";
import { DeviationsBoard } from "@/features/kitchen/components/deviations-board";

export const metadata = { title: "Küche — Abweichungen" };

export default function DeviationsPage() {
  return <><PageHeader title="Abweichungen" subtitle="Fehlmengen, Ausschuss, technische Probleme und Sofortmaßnahmen nachvollziehbar erfassen." /><DeviationsBoard /></>;
}

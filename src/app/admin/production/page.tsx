import { PageHeader, Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { Produktionstabelle } from "@/features/production/components/produktionstabelle";

export const metadata = { title: "Produktionsplanung" };

export default function ProductionPage() {
  return (
    <>
      <PageHeader
        title="Produktionsplanung"
        subtitle="Aggregierte, bestätigte Bestellmengen je Tag und Standort. Bestellte Menge + dokumentierte Zusatzmenge = finale Produktionsmenge."
        actions={<Button href="/admin/production/new"><Plus size={16} aria-hidden /> Produktionsplan erstellen</Button>}
      />
      <Produktionstabelle />
    </>
  );
}

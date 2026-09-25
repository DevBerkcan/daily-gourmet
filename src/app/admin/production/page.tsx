import { PageHeader, Button, ACTION_ICONS } from "@/components/ui";
import { Produktionstabelle } from "@/features/production/components/produktionstabelle";

export const metadata = { title: "Produktionsplanung" };

export default function ProductionPage() {
  return (
    <>
      <PageHeader
        title="Produktionsplanung"
        subtitle="Aggregierte, bestätigte Bestellmengen je Tag und Standort. Bestellte Menge + dokumentierte Zusatzmenge = finale Produktionsmenge."
        actions={<Button href="/admin/production/new" icon={ACTION_ICONS.create} label="Produktionsplan erstellen" showLabel />}
      />
      <Produktionstabelle />
    </>
  );
}

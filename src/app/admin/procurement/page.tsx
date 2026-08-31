import { PageHeader } from "@/components/ui";
import { ProcurementWeekOverview } from "@/features/procurement/components/procurement-week-overview";
import { ProcurementBoard } from "@/features/procurement/components/procurement-board";

export const metadata = { title: "Einkauf" };

export default function ProcurementPage() {
  return (
    <>
      <PageHeader
        title="Einkaufs- und Bedarfslisten"
        subtitle="Aggregierter Zutatenbedarf aus den Produktionsplänen — identische Zutaten werden zusammengefasst und in Einkaufseinheiten umgerechnet."
      />
      <ProcurementWeekOverview />
      <ProcurementBoard />
    </>
  );
}

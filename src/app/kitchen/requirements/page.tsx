import { PageHeader } from "@/components/ui";
import { produktionsplaene } from "@/features/production/data";
import { PrintButton } from "@/features/kitchen/components/print-button";
import { RequirementsBoard } from "@/features/kitchen/components/requirements-board";

export const metadata = { title: "Küche — Gesamtbedarf" };

export default function RequirementsPage() {
  const plan = produktionsplaene[0];
  return (
    <>
      <PageHeader title="Gesamtbedarf heute" subtitle="Alle Zutaten aus dem Tagesplan zusammengefasst und nach Lagerort sortiert." actions={<PrintButton label="Bereitstellungsliste drucken" />} />
      <RequirementsBoard planId={plan.id} />
    </>
  );
}

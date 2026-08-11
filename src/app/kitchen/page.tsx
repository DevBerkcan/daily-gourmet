import { PageHeader, DummyNote } from "@/components/ui";
import { standortById } from "@/lib/data";
import { produktionsplaene } from "@/features/production/data";
import { PrintButton } from "@/features/kitchen/components/print-button";
import { TodayBoard } from "@/features/kitchen/components/today-board";

export const metadata = { title: "Küche — Heutige Produktion" };

export default function KitchenDashboard() {
  const heute = produktionsplaene[0];
  return (
    <>
      <PageHeader
        title="Heutige Produktion"
        subtitle={`Donnerstag, 06. August 2026 · ${standortById(heute.standortId)?.name} · Produktionsstart 06:15 Uhr`}
        actions={<PrintButton />}
      />
      <TodayBoard />
      <DummyNote />
    </>
  );
}

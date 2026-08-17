import { PageHeader } from "@/components/ui";
import { PrintButton } from "@/features/kitchen/components/print-button";
import { TodayBoard } from "@/features/kitchen/components/today-board";

export const metadata = { title: "Küche — Heutige Produktion" };

export default function KitchenDashboard() {
  return (
    <>
      <PageHeader
        title="Heutige Produktion"
        subtitle="Donnerstag, 06. August 2026 · Produktionsstart 06:15 Uhr"
        actions={<PrintButton />}
      />
      <TodayBoard />
    </>
  );
}

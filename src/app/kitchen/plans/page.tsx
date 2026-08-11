import { PageHeader } from "@/components/ui";
import { PlansBoard } from "@/features/kitchen/components/plans-board";

export const metadata = { title: "Küche — Produktionspläne" };

export default function KitchenPlansPage() {
  return (
    <>
      <PageHeader
        title="Produktionspläne"
        subtitle="Hier sieht die Produktion ausschließlich die freigegebenen Tagesmengen. Gericht anklicken, um Zutatenbedarf und Zubereitung zu öffnen."
      />
      <PlansBoard />
    </>
  );
}

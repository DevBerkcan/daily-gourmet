import { PageHeader, DummyNote } from "@/components/ui";
import { UmsatzUebersicht } from "./umsatz-uebersicht";

export const metadata = { title: "Umsatz" };

export default function RevenuePage() {
  return (
    <>
      <PageHeader
        title="Umsatz"
        subtitle="Umsatz aus Bestellungen der Einrichtungen — Portionen × vereinbarter Portionspreis, nach Kalenderwoche."
      />
      <UmsatzUebersicht />
      <DummyNote />
    </>
  );
}

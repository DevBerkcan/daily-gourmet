import { PageHeader } from "@/components/ui";
import { PrintButton } from "@/features/kitchen/components/print-button";
import { PackingBoard } from "@/features/kitchen/components/packing-board";

export const metadata = { title: "Küche — Verpackung & Ausgabe" };

export default function PackingPage() {
  return <><PageHeader title="Verpackung & Tourbereitstellung" subtitle="Essen nach Route und Stoppreihenfolge verpacken, kennzeichnen und an den richtigen Fahrer übergeben." actions={<PrintButton label="Tour-Packlisten drucken" />} /><PackingBoard /></>;
}

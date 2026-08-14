import { PageHeader } from "@/components/ui";
import { ControlsBoard } from "@/features/kitchen/components/controls-board";

export const metadata = { title: "Küche — Kontrollen" };

export default function ControlsPage() {
  return <><PageHeader title="Kontrollen & HACCP" subtitle="Temperaturen und Pflichtkontrollen direkt am Arbeitsschritt dokumentieren." /><ControlsBoard /></>;
}

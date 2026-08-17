import { PageHeader, Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { ZutatenTabelle } from "@/features/ingredients/components/zutaten-tabelle";

export const metadata = { title: "Zutaten" };

export default function IngredientsPage() {
  return (
    <>
      <PageHeader
        title="Zutaten"
        subtitle="Zutatenstamm mit Einheiten, Allergenen und Nährwerten. Nährwerte werden aktuell manuell erfasst."
        actions={<Button href="/admin/ingredients/new"><Plus size={16} aria-hidden /> Zutat anlegen</Button>}
      />

      <ZutatenTabelle />
    </>
  );
}

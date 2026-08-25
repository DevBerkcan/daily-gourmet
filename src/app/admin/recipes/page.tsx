import { PageHeader, Card, Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { RezepteTabelle } from "@/features/recipes/components/rezepte-tabelle";

export const metadata = { title: "Rezepte" };

export default function RecipesPage() {
  return (
    <>
      <PageHeader
        title="Rezepte"
        subtitle="Allergene werden automatisch aus den Zutaten ermittelt. Veröffentlichte Speisepläne behalten die damals gültige Rezeptversion (Snapshot)."
        actions={<Button href="/admin/recipes/new"><Plus size={16} aria-hidden /> Rezept erstellen</Button>}
      />
      <Card>
        <RezepteTabelle />
      </Card>
    </>
  );
}

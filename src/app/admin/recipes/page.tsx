import { PageHeader, Card, Button, ACTION_ICONS } from "@/components/ui";
import { RezepteTabelle } from "@/features/recipes/components/rezepte-tabelle";

export const metadata = { title: "Rezepte" };

export default function RecipesPage() {
  return (
    <>
      <PageHeader
        title="Rezepte"
        subtitle="Allergene werden automatisch aus den Zutaten ermittelt. Veröffentlichte Speisepläne behalten die damals gültige Rezeptversion (Snapshot)."
        actions={<Button href="/admin/recipes/new" icon={ACTION_ICONS.create} label="Rezept erstellen" />}
      />
      <Card>
        <RezepteTabelle />
      </Card>
    </>
  );
}

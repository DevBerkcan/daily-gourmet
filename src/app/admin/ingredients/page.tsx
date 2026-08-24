import { PageHeader, Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { ZutatenTabelle } from "@/features/ingredients/components/zutaten-tabelle";
import { PreislisteImportPanel } from "@/features/ingredients/components/preisliste-import-panel";

export const metadata = { title: "Zutaten" };

export default function IngredientsPage() {
  return (
    <>
      <PageHeader
        title="Zutaten"
        subtitle="Zutatenstamm mit Einheiten, Allergenen und Nährwerten. Neue Zutaten kommen über den Rezeptrechner-Import auf der Rezepte-Seite herein, oder werden hier manuell angelegt."
        actions={<Button href="/admin/ingredients/new"><Plus size={16} aria-hidden /> Zutat anlegen</Button>}
      />

      <ZutatenTabelle />
      <PreislisteImportPanel />
    </>
  );
}

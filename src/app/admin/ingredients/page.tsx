import { PageHeader, Button, ACTION_ICONS } from "@/components/ui";
import { ZutatenTabelle } from "@/features/ingredients/components/zutaten-tabelle";
import { PreislisteImportPanel } from "@/features/ingredients/components/preisliste-import-panel";
import { RezeptrechnerImportPanel } from "@/features/recipes/components/rezeptrechner-import-panel";

export const metadata = { title: "Zutaten" };

export default function IngredientsPage() {
  return (
    <>
      <PageHeader
        title="Zutaten"
        subtitle="Zutatenstamm mit Einheiten, Allergenen und Nährwerten. Neue Zutaten kommen über den Rezeptrechner-Import weiter unten herein, oder werden hier manuell angelegt."
        actions={<Button href="/admin/ingredients/new" icon={ACTION_ICONS.create} label="Zutat anlegen" />}
      />

      <ZutatenTabelle />
      <PreislisteImportPanel />
      <RezeptrechnerImportPanel />
    </>
  );
}

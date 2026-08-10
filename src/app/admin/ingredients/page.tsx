import { PageHeader, Button, DummyNote } from "@/components/ui";
import { Plus, Sparkles } from "lucide-react";
import { ZutatenTabelle } from "./zutaten-tabelle";

export const metadata = { title: "Zutaten" };

export default function IngredientsPage() {
  return (
    <>
      <PageHeader
        title="Zutaten"
        subtitle="Zutatenstamm mit Einheiten, Allergenen und Nährwerten. Nährwerte werden beim Anlegen automatisch über die Lebensmittel-API (Open Food Facts / USDA) abgerufen."
        actions={<Button href="/admin/ingredients/new"><Plus size={16} aria-hidden /> Zutat anlegen</Button>}
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-card border border-saffron-soft bg-saffron-soft px-4 py-3 text-sm text-ink no-print">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-saffron" aria-hidden />
        <p>
          <span className="font-medium">Nährwert-API aktiv:</span> Beim Anlegen einer Zutat wird per EAN oder Suchbegriff die Lebensmittel-Datenbank abgefragt.
          Die Werte (kcal, Eiweiß, Fett, Kohlenhydrate, Zucker, Salz je 100 g) werden übernommen und können manuell überschrieben werden.
        </p>
      </div>

      <ZutatenTabelle />
      <DummyNote />
    </>
  );
}

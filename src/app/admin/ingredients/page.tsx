import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, Tag, DummyNote } from "@/components/ui";
import { zutaten } from "@/lib/data";
import { Plus, Download, Sparkles } from "lucide-react";

export const metadata = { title: "Zutaten" };

export default function IngredientsPage() {
  return (
    <>
      <PageHeader
        title="Zutaten"
        subtitle="Zutatenstamm mit Einheiten, Allergenen und Nährwerten. Nährwerte werden beim Anlegen automatisch über die Lebensmittel-API (Open Food Facts / USDA) abgerufen."
        actions={
          <>
            <Button variant="secondary"><Download size={15} aria-hidden /> CSV-Export</Button>
            <Button><Plus size={16} aria-hidden /> Zutat anlegen</Button>
          </>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-card border border-saffron-soft bg-saffron-soft px-4 py-3 text-sm text-ink no-print">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-saffron" aria-hidden />
        <p>
          <span className="font-medium">Nährwert-API aktiv:</span> Beim Anlegen einer Zutat wird per EAN oder Suchbegriff die Lebensmittel-Datenbank abgefragt.
          Die Werte (kcal, Eiweiß, Fett, Kohlenhydrate, Zucker, Salz je 100 g) werden übernommen und können manuell überschrieben werden.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Zutat oder Artikelnummer suchen …" />
          <select aria-label="Nach Kategorie filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Kategorien</option><option>Gemüse</option><option>Fleisch &amp; Geflügel</option><option>Molkereiprodukte</option><option>Trockenware</option><option>Konserven</option><option>Hülsenfrüchte</option>
          </select>
          <select aria-label="Nach Allergen filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Allergene</option><option>Gluten</option><option>Milch</option><option>Eier</option>
          </select>
        </div>
        <Table head={["Zutat", "Kategorie", "Basiseinheit", "Einkaufseinheit", "kcal / 100", "Allergene", "Ernährung", "Lieferant", "Status"]}>
          {zutaten.map((z) => (
            <tr key={z.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{z.name}</span>
                <span className="block text-xs text-muted">{z.artikelnummer}</span>
              </Td>
              <Td className="text-muted">{z.kategorie}</Td>
              <Td>{z.basiseinheit}</Td>
              <Td className="text-muted">{z.einkaufseinheit}</Td>
              <Td>
                <span className="font-medium">{z.naehrwertePro100.kcal}</span>
                <span className="block text-[11px] text-muted">{z.naehrwertePro100.quelle}</span>
              </Td>
              <Td>
                {z.allergene.length > 0
                  ? <span className="flex flex-wrap gap-1">{z.allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}</span>
                  : <span className="text-muted">—</span>}
              </Td>
              <Td>
                <span className="flex gap-1">
                  {z.vegan ? <Tag tone="green">vegan</Tag> : z.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : <span className="text-muted">—</span>}
                </span>
              </Td>
              <Td className="text-muted">{z.lieferant}</Td>
              <Td><StatusBadge status={z.aktiv ? "AKTIV" : "INAKTIV"} /></Td>
            </tr>
          ))}
        </Table>
        <p className="border-t border-line px-5 py-3 text-xs text-muted">8 von 8 Zutaten · Unzulässige Umrechnungen (z. B. kg → l) sind ohne individuellen Faktor gesperrt.</p>
      </Card>
      <DummyNote />
    </>
  );
}

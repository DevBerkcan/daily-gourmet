import Link from "next/link";
import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, Tag, DummyNote } from "@/components/ui";
import { rezepte, rezeptAllergene } from "@/lib/data";
import { Plus } from "lucide-react";

export const metadata = { title: "Rezepte" };

export default function RecipesPage() {
  return (
    <>
      <PageHeader
        title="Rezepte"
        subtitle="Allergene werden automatisch aus den Zutaten ermittelt. Veröffentlichte Speisepläne behalten die damals gültige Rezeptversion (Snapshot)."
        actions={<Button><Plus size={16} aria-hidden /> Rezept erstellen</Button>}
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Rezept suchen …" />
          <select aria-label="Nach Kategorie filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Kategorien</option><option>Hauptgericht</option><option>Süßspeise</option><option>Beilage</option>
          </select>
        </div>
        <Table head={["Rezept", "Kategorie", "Portionen (Std.)", "Zeit", "Allergene", "Ernährung", "Version", "Status"]}>
          {rezepte.map((r) => {
            const allergene = rezeptAllergene(r);
            return (
              <tr key={r.id} className="hover:bg-paper">
                <Td>
                  <Link href={`/admin/recipes/${r.id}`} className="font-medium text-basil hover:underline">{r.name}</Link>
                  <span className="block max-w-64 truncate text-xs text-muted">{r.beschreibung}</span>
                </Td>
                <Td className="text-muted">{r.kategorie}</Td>
                <Td>{r.standardPortionen}</Td>
                <Td className="text-muted">{r.zubereitungszeitMin} Min.</Td>
                <Td>
                  {allergene.length > 0
                    ? <span className="flex flex-wrap gap-1">{allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}</span>
                    : <span className="text-muted">—</span>}
                </Td>
                <Td>{r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : <span className="text-muted">—</span>}</Td>
                <Td className="text-muted">v{r.version}</Td>
                <Td><StatusBadge status={r.aktiv ? "AKTIV" : "ARCHIVIERT"} /></Td>
              </tr>
            );
          })}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}

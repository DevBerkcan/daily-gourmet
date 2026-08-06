import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Table, Td, Button, Tag, DummyNote } from "@/components/ui";
import { rezepte, zutatById, rezeptAllergene } from "@/lib/data";
import { Copy, Printer } from "lucide-react";
import { RezeptSkalierung } from "./skalierung";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rezept = rezepte.find((r) => r.id === id);
  if (!rezept) notFound();
  const allergene = rezeptAllergene(rezept);

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{rezept.name}</span>
      </nav>

      <PageHeader
        title={rezept.name}
        subtitle={`${rezept.kategorie} · Standard: ${rezept.standardPortionen} Portionen · ${rezept.zubereitungszeitMin} Min. · Version ${rezept.version}`}
        actions={
          <>
            <Button variant="secondary"><Printer size={15} aria-hidden /> Druckansicht</Button>
            <Button variant="secondary"><Copy size={15} aria-hidden /> Duplizieren</Button>
            <Button>Bearbeiten</Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {rezept.vegan ? <Tag tone="green">vegan</Tag> : rezept.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : null}
        {allergene.map((a) => <Tag key={a} tone="amber">Allergen: {a}</Tag>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <RezeptSkalierung rezept={rezept} />

          <Card>
            <CardHeader title="Zubereitung" hint={rezept.produktionshinweise ? `Produktionshinweis: ${rezept.produktionshinweise}` : undefined} />
            <ol className="flex flex-col gap-0 divide-y divide-line">
              {rezept.zubereitungsschritte.map((s, i) => (
                <li key={s} className="flex gap-4 px-5 py-3.5 text-sm">
                  <span className="font-display font-semibold text-basil">{i + 1}</span>
                  <span className="text-ink">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Nährwerte je Portion" hint="Berechnet aus den API-Nährwerten der Zutaten (je 100 g/ml)" />
          <Table head={["Zutat", "Menge", "kcal-Anteil"]}>
            {rezept.zutaten.map((rz) => {
              const z = zutatById(rz.zutatId);
              if (!z) return null;
              const faktor = (rz.menge * (z.basiseinheit === "Stück" ? 1 : 1000)) / 100 / rezept.standardPortionen;
              const kcal = Math.round(z.naehrwertePro100.kcal * faktor);
              return (
                <tr key={rz.zutatId}>
                  <Td className="font-medium text-ink">{z.name}</Td>
                  <Td className="text-muted">{rz.menge} {rz.einheit}</Td>
                  <Td>{kcal} kcal</Td>
                </tr>
              );
            })}
          </Table>
          <p className="border-t border-line px-5 py-3 text-xs text-muted">
            Quelle: Open Food Facts / USDA FoodData Central · Werte pro Portion bei Standardmenge.
          </p>
        </Card>
      </div>

      <DummyNote />
    </>
  );
}

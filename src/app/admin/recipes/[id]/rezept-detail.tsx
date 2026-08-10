"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Card, CardHeader, Table, Td, Button, Tag, EmptyState, DummyNote } from "@/components/ui";
import { Copy, Printer } from "lucide-react";
import { RezeptSkalierung } from "./skalierung";
import { RezeptFormular, type RezeptFormDaten } from "../rezept-formular";
import { useRezepte, updateRezept, duplicateRezept, rezeptAllergeneLive, rezeptZusatzstoffeLive, rezeptBioAnteilLive, rezeptRegionalAnteilLive, rezeptWareneinsatzLive } from "../store";
import { useZutaten } from "../../ingredients/store";

export function RezeptDetail({ id }: { id: string }) {
  const router = useRouter();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const rezept = rezepte.find((r) => r.id === id);
  const [bearbeiten, setBearbeiten] = useState(false);

  if (!rezept) {
    return (
      <>
        <Card>
          <EmptyState title="Rezept nicht gefunden" text="Dieses Rezept existiert nicht (mehr) in dieser Sitzung." action={<Button href="/admin/recipes">Zurück zur Übersicht</Button>} />
        </Card>
        <DummyNote />
      </>
    );
  }

  if (bearbeiten) {
    return (
      <>
        <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
          <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{rezept.name}</span>
        </nav>
        <PageHeader title={`${rezept.name} bearbeiten`} />
        <RezeptFormular
          initial={rezept}
          onSubmit={(input: RezeptFormDaten) => {
            updateRezept(rezept.id, { ...input, erstelltVon: rezept.erstelltVon, erstelltAm: rezept.erstelltAm, aktualisiertAm: new Date().toISOString().slice(0, 10) });
            setBearbeiten(false);
          }}
          onAbbrechen={() => setBearbeiten(false)}
        />
      </>
    );
  }

  const allergene = rezeptAllergeneLive(rezept, zutaten);
  const zusatzstoffe = rezeptZusatzstoffeLive(rezept, zutaten);
  const bioAnteil = rezeptBioAnteilLive(rezept, zutaten);
  const regionalAnteil = rezeptRegionalAnteilLive(rezept, zutaten);
  const wareneinsatz = rezeptWareneinsatzLive(rezept, zutaten);

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{rezept.name}</span>
      </nav>

      <PageHeader
        title={rezept.name}
        subtitle={`${rezept.kategorie} · Standard: ${rezept.standardPortionen} Portionen · ${rezept.zubereitungszeitMin} Min. · ${rezept.schwierigkeit} · Version ${rezept.version}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button>
            <Button
              variant="secondary"
              onClick={() => {
                const kopie = duplicateRezept(rezept.id);
                if (kopie) router.push(`/admin/recipes/${kopie.id}`);
              }}
            >
              <Copy size={15} aria-hidden /> Duplizieren
            </Button>
            <Button onClick={() => setBearbeiten(true)}>Bearbeiten</Button>
          </>
        }
      />

      <p className="mb-4 text-xs text-muted">
        Erstellt von {rezept.erstelltVon} am {new Date(rezept.erstelltAm).toLocaleDateString("de-DE")}
        {rezept.aktualisiertAm && ` · zuletzt geändert am ${new Date(rezept.aktualisiertAm).toLocaleDateString("de-DE")}`}
      </p>

      {rezept.bildUrl && <img src={rezept.bildUrl} alt={rezept.name} className="mb-4 h-48 w-full rounded-card border border-line object-cover" />}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {rezept.vegan ? <Tag tone="green">vegan</Tag> : rezept.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : null}
        {rezept.zielgruppen.map((z) => <Tag key={z}>{z}</Tag>)}
        {bioAnteil > 0 && <Tag tone="green">Bio-Anteil {bioAnteil} %</Tag>}
        {regionalAnteil > 0 && <Tag tone="green">Regional-Anteil {regionalAnteil} %</Tag>}
        {allergene.map((a) => <Tag key={a} tone="amber">Allergen: {a}</Tag>)}
        {zusatzstoffe.map((z) => <Tag key={z}>{z}</Tag>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <RezeptSkalierung rezept={rezept} zutaten={zutaten} />

          <Card>
            <CardHeader title="Zubereitung" hint={rezept.produktionshinweise ? `Produktionshinweis: ${rezept.produktionshinweise}` : undefined} />
            <ol className="flex flex-col gap-0 divide-y divide-line">
              {rezept.zubereitungsschritte.map((s, i) => (
                <li key={s + i} className="flex gap-4 px-5 py-3.5 text-sm">
                  <span className="font-display font-semibold text-basil">{i + 1}</span>
                  <span className="text-ink">{s}</span>
                </li>
              ))}
            </ol>
          </Card>

          {(rezept.kerntemperaturC != null || rezept.lagerhinweis || rezept.haltbarkeitNachZubereitung) && (
            <Card>
              <CardHeader title="Küchen- & HACCP-Hinweise" />
              <Table head={["Feld", "Wert"]}>
                {rezept.kerntemperaturC != null && <tr><Td className="font-medium text-ink">Kerntemperatur</Td><Td>{rezept.kerntemperaturC} °C</Td></tr>}
                {rezept.lagerhinweis && <tr><Td className="font-medium text-ink">Lagerhinweis</Td><Td>{rezept.lagerhinweis}</Td></tr>}
                {rezept.haltbarkeitNachZubereitung && <tr><Td className="font-medium text-ink">Haltbarkeit nach Zubereitung</Td><Td>{rezept.haltbarkeitNachZubereitung}</Td></tr>}
              </Table>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="h-fit">
            <CardHeader title="Nährwerte je Portion" hint="Berechnet aus den Nährwerten der Zutaten (je 100 g/ml)" />
            <Table head={["Zutat", "Menge", "kcal-Anteil"]}>
              {rezept.zutaten.map((rz) => {
                const z = zutaten.find((zt) => zt.id === rz.zutatId);
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

          <Card className="h-fit">
            <CardHeader title="Kalkulation" hint="Wareneinsatz auf Basis der aktuellen Einkaufspreise" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 text-sm">
              <span className="text-muted">Wareneinsatz gesamt:</span>
              <span className="font-display text-lg font-semibold text-basil">{wareneinsatz.gesamt.toLocaleString("de-DE")} €</span>
              <span className="ml-auto text-muted">je Portion:</span>
              <span className="font-display text-lg font-semibold text-basil">{wareneinsatz.proPortion.toLocaleString("de-DE")} €</span>
            </div>
          </Card>
        </div>
      </div>

      <DummyNote />
    </>
  );
}

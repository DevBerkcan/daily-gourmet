"use client";

import { useState } from "react";
import Link from "next/link";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, Tag, EmptyState, LoadingState } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ZutatFormular } from "./zutat-formular";
import { PreisePanel } from "./preise-panel";
import { useZutaten, useUpdateZutat, type Zutat } from "@/lib/services/ingredients";

export function ZutatDetail({ id }: { id: string }) {
  const toast = useToast();
  const zutaten = useZutaten();
  const zutat = zutaten.find((z) => z.id === id);
  const ladend = useIsFetching({ queryKey: ["ingredients"] }) > 0 && zutaten.length === 0;
  const updateZutat = useUpdateZutat();
  const [bearbeiten, setBearbeiten] = useState(false);

  if (!zutat) {
    return (
      <>
        <Card>
          {ladend ? (
            <LoadingState text="Zutat wird geladen …" />
          ) : (
            <EmptyState title="Zutat nicht gefunden" text="Diese Zutat existiert nicht (mehr)." action={<Button href="/admin/ingredients">Zurück zur Übersicht</Button>} />
          )}
        </Card>
      </>
    );
  }

  if (bearbeiten) {
    return (
      <>
        <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
          <Link href="/admin/ingredients" className="hover:text-basil hover:underline">Zutaten</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{zutat.name}</span>
        </nav>
        <PageHeader title={`${zutat.name} bearbeiten`} />
        <ZutatFormular
          initial={zutat}
          onSubmit={(input: Omit<Zutat, "id">) => {
            updateZutat.mutate(
              { id: zutat.id, input },
              {
                onSuccess: () => { setBearbeiten(false); toast.success("Zutat wurde gespeichert."); },
                onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen."),
              }
            );
          }}
          onAbbrechen={() => setBearbeiten(false)}
        />
      </>
    );
  }

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/ingredients" className="hover:text-basil hover:underline">Zutaten</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{zutat.name}</span>
      </nav>

      <PageHeader
        title={zutat.name}
        subtitle={`${zutat.kategorie} · ${zutat.artikelnummer} · ${zutat.lieferant}`}
        actions={<Button onClick={() => setBearbeiten(true)}>Bearbeiten</Button>}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={zutat.aktiv ? "AKTIV" : "INAKTIV"} />
        <Tag tone={zutat.quelle === "Rezeptrechner" ? "neutral" : "green"}>{zutat.quelle}</Tag>
        {zutat.manuellBearbeitet && zutat.quelle === "Rezeptrechner" && <Tag tone="amber">manuell angepasst</Tag>}
        {zutat.vegan ? <Tag tone="green">vegan</Tag> : zutat.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : null}
        {zutat.bio && <Tag tone="green">Bio</Tag>}
        {zutat.regional && <Tag tone="green">Regional</Tag>}
        {zutat.allergene.map((a) => <Tag key={a} tone="amber">Allergen: {a}</Tag>)}
        {zutat.zusatzstoffe.map((z) => <Tag key={z}>{z}</Tag>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Einheiten & Standardpreis" hint="Fällt zurück, solange kein Lieferantenpreis hinterlegt ist" />
          <Table head={["Feld", "Wert"]}>
            <tr><Td className="font-medium text-ink">Basiseinheit</Td><Td>{zutat.basiseinheit}</Td></tr>
            <tr><Td className="font-medium text-ink">Einkaufseinheit</Td><Td>{zutat.einkaufseinheit || "—"}</Td></tr>
            <tr><Td className="font-medium text-ink">Umrechnungsfaktor</Td><Td>{zutat.umrechnungsfaktor}</Td></tr>
            <tr><Td className="font-medium text-ink">Standardpreis</Td><Td>{zutat.einkaufspreis != null ? `${zutat.einkaufspreis.toLocaleString("de-DE")} €` : "—"}</Td></tr>
            {zutat.guenstigsterPreis != null && (
              <tr><Td className="font-medium text-ink">Günstigster Lieferant</Td><Td>{zutat.guenstigsterLieferantName} · {zutat.guenstigsterPreis.toLocaleString("de-DE")} €</Td></tr>
            )}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Nährwerte je 100 g / 100 ml" hint={`Quelle: ${zutat.naehrwertePro100.quelle}`} />
          <Table head={["Nährwert", "Menge"]}>
            <tr><Td className="font-medium text-ink">Energie</Td><Td>{zutat.naehrwertePro100.kcal} kcal / {zutat.naehrwertePro100.kj} kJ</Td></tr>
            <tr><Td className="font-medium text-ink">Fett</Td><Td>{zutat.naehrwertePro100.fettG} g</Td></tr>
            <tr><Td className="pl-8 text-muted">davon gesättigte Fettsäuren</Td><Td>{zutat.naehrwertePro100.gesFettSaeurenG} g</Td></tr>
            <tr><Td className="font-medium text-ink">Kohlenhydrate</Td><Td>{zutat.naehrwertePro100.kohlenhydrateG} g</Td></tr>
            <tr><Td className="pl-8 text-muted">davon Zucker</Td><Td>{zutat.naehrwertePro100.zuckerG} g</Td></tr>
            <tr><Td className="font-medium text-ink">Ballaststoffe</Td><Td>{zutat.naehrwertePro100.ballaststoffeG} g</Td></tr>
            <tr><Td className="font-medium text-ink">Eiweiß</Td><Td>{zutat.naehrwertePro100.eiweissG} g</Td></tr>
            <tr><Td className="font-medium text-ink">Salz</Td><Td>{zutat.naehrwertePro100.salzG} g</Td></tr>
            <tr><Td className="font-medium text-ink">Alkohol</Td><Td>{zutat.naehrwertePro100.alkoholG} g</Td></tr>
          </Table>
        </Card>
      </div>

      <div className="mt-6">
        <PreisePanel zutatId={zutat.id} />
      </div>
    </>
  );
}

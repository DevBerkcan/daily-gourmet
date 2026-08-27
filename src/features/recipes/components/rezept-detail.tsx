"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Card, CardHeader, Table, Td, Button, Tag, EmptyState, LoadingState } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { Copy, Printer, Sigma } from "lucide-react";
import { RezeptSkalierung } from "./skalierung";
import { RezeptFormular, type RezeptFormDaten } from "./rezept-formular";
import { EtikettButton } from "./etikett-button";
import { NaehrwerteModal } from "./naehrwerte-modal";
import {
  useRezepte,
  useUpdateRezept,
  useDuplicateRezept,
  rezeptAllergeneLive,
  rezeptZusatzstoffeLive,
  rezeptBioAnteilLive,
  rezeptRegionalAnteilLive,
  naehrwerteProPortion,
} from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";

export function RezeptDetail({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const rezept = rezepte.find((r) => r.id === id);
  const ladend = useIsFetching({ queryKey: ["recipes"] }) > 0 && rezepte.length === 0;
  const updateRezept = useUpdateRezept();
  const duplicateRezept = useDuplicateRezept();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [naehrwertModus, setNaehrwertModus] = useState<"portion" | "100g">("portion");
  const [naehrwerteAnsehen, setNaehrwerteAnsehen] = useState(false);

  if (!rezept) {
    return (
      <Card>
        {ladend ? (
          <LoadingState text="Rezept wird geladen …" />
        ) : (
          <EmptyState title="Rezept nicht gefunden" text="Dieses Rezept existiert nicht (mehr)." action={<Button href="/admin/recipes">Zurück zur Übersicht</Button>} />
        )}
      </Card>
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
            updateRezept.mutate(
              { id: rezept.id, input },
              {
                onSuccess: () => { setBearbeiten(false); toast.success("Rezept wurde gespeichert."); },
                onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen."),
              }
            );
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

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{rezept.name}</span>
      </nav>

      <PageHeader
        title={rezept.name}
        subtitle={`${rezept.rezeptnummer ? rezept.rezeptnummer + " · " : ""}${rezept.kategorie} · Standard: ${rezept.standardPortionen} Portionen · ${rezept.zubereitungszeitMin} Min. · ${rezept.schwierigkeit} · Version ${rezept.version}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button>
            <Button variant="secondary" onClick={() => setNaehrwerteAnsehen(true)}><Sigma size={15} aria-hidden /> Nährwerte ansehen</Button>
            <EtikettButton rezeptId={rezept.id} rezeptName={rezept.name} portionsgewichtG={rezept.portionsgewichtG} />
            <Button
              variant="secondary"
              onClick={() => {
                duplicateRezept.mutate(rezept.id, {
                  onSuccess: (kopie) => { router.push(`/admin/recipes/${kopie.id}`); toast.success("Rezept wurde dupliziert."); },
                  onError: () => toast.error("Duplizieren fehlgeschlagen. Bitte erneut versuchen."),
                });
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
        {rezept.glutenfrei && <Tag tone="green">glutenfrei</Tag>}
        {rezept.laktosefrei && <Tag tone="green">laktosefrei</Tag>}
        {rezept.dgeZertifiziert && <Tag tone="green">DGE-zertifiziert</Tag>}
        {rezept.zielgruppen.map((z) => <Tag key={z}>{z}</Tag>)}
        {bioAnteil > 0 && <Tag tone="green">Bio-Anteil {bioAnteil} %</Tag>}
        {regionalAnteil > 0 && <Tag tone="green">Regional-Anteil {regionalAnteil} %</Tag>}
        {rezept.nutriScore && <Tag tone="green">Nutri-Score {rezept.nutriScore}</Tag>}
        {allergene.map((a) => <Tag key={a} tone="amber">Allergen: {a}</Tag>)}
        {zusatzstoffe.map((z) => <Tag key={z}>{z}</Tag>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <RezeptSkalierung rezept={rezept} />

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
          {rezept.naehrwertePro100g ? (
            <Card className="h-fit">
              <CardHeader
                title={`Nährwerte je ${naehrwertModus === "portion" ? "Portion" : "100 g"}`}
                hint={rezept.nutriScoreKategorie ? `Aus Kennzeichnungsdaten importiert · ${rezept.nutriScoreKategorie}` : "Aus Kennzeichnungsdaten importiert"}
                actions={
                  rezept.portionsgewichtG ? (
                    <div className="flex overflow-hidden rounded-lg border border-line text-xs no-print">
                      <button type="button" onClick={() => setNaehrwertModus("portion")} className={`px-2.5 py-1.5 font-medium ${naehrwertModus === "portion" ? "bg-basil-soft text-basil" : "text-muted hover:bg-paper"}`}>je Portion</button>
                      <button type="button" onClick={() => setNaehrwertModus("100g")} className={`px-2.5 py-1.5 font-medium ${naehrwertModus === "100g" ? "bg-basil-soft text-basil" : "text-muted hover:bg-paper"}`}>je 100 g</button>
                    </div>
                  ) : undefined
                }
              />
              {(() => {
                const n = naehrwertModus === "portion" && rezept.portionsgewichtG
                  ? naehrwerteProPortion(rezept.naehrwertePro100g, rezept.portionsgewichtG)
                  : rezept.naehrwertePro100g;
                return (
                  <Table head={["Nährwert", "Wert"]}>
                    <tr><Td className="font-medium text-ink">Energie</Td><Td>{n.kcal.toLocaleString("de-DE")} kcal / {n.kj.toLocaleString("de-DE")} kJ</Td></tr>
                    <tr><Td className="font-medium text-ink">Fett</Td><Td>{n.fettG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="pl-8 text-muted">davon gesättigte Fettsäuren</Td><Td>{n.gesFettSaeurenG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="font-medium text-ink">Kohlenhydrate</Td><Td>{n.kohlenhydrateG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="pl-8 text-muted">davon Zucker</Td><Td>{n.zuckerG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="font-medium text-ink">Ballaststoffe</Td><Td>{n.ballaststoffeG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="font-medium text-ink">Eiweiß</Td><Td>{n.eiweissG.toLocaleString("de-DE")} g</Td></tr>
                    <tr><Td className="font-medium text-ink">Salz</Td><Td>{n.salzG.toLocaleString("de-DE")} g</Td></tr>
                  </Table>
                );
              })()}
              {rezept.naehrwertbezogeneAngaben && rezept.naehrwertbezogeneAngaben.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-line px-5 py-3">
                  {rezept.naehrwertbezogeneAngaben.map((a) => <Tag key={a} tone="green">{a}</Tag>)}
                </div>
              )}
            </Card>
          ) : (
            <Card className="h-fit">
              <CardHeader title="Nährwerte je Portion" hint="Berechnet aus den Nährwerten der Zutaten (je 100 g/ml)" />
              <Table head={["Zutat", "Menge", "kcal-Anteil"]}>
                {rezept.zutaten.map((rz) => {
                  const z = zutaten.find((zt) => zt.id === rz.zutatId);
                  if (!z) return null;
                  const faktor = (rz.menge * (z.basiseinheit === "Stück" ? 1 : 1000)) / 100 / rezept.standardPortionen;
                  const kcal = Math.round(z.naehrwertePro100.kcal * faktor);
                  return (
                    <tr key={rz.id ?? rz.zutatId}>
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
          )}

          <Card className="h-fit">
            <CardHeader title="Kalkulation" hint="Geschätzt anhand der günstigsten hinterlegten Lieferantenpreise, ersatzweise Standardpreis" />
            {rezept.geschaetzteKostenProPortion != null ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 text-sm">
                <span className="text-muted">Wareneinsatz gesamt:</span>
                <span className="font-display text-lg font-semibold text-basil">{(rezept.geschaetzteKostenProPortion * rezept.standardPortionen).toLocaleString("de-DE")} €</span>
                <span className="ml-auto text-muted">je Portion:</span>
                <span className="font-display text-lg font-semibold text-basil">{rezept.geschaetzteKostenProPortion.toLocaleString("de-DE")} €</span>
              </div>
            ) : (
              <p className="px-5 py-4 text-sm text-muted">Für die Zutaten dieses Rezepts sind noch keine Einkaufspreise hinterlegt.</p>
            )}
          </Card>
        </div>
      </div>

      {naehrwerteAnsehen && <NaehrwerteModal rezept={rezept} onClose={() => setNaehrwerteAnsehen(false)} />}
    </>
  );
}

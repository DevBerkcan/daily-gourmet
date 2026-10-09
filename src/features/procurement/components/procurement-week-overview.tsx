"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, PackageSearch, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader, Table, Td, Button, EmptyState } from "@/components/ui";
import { useEinkaufsWochen, useWochenRezeptBedarf, useWochenZutatBedarf } from "@/lib/services/procurement-overview";

const weekKey = (jahr: number, kalenderwoche: number) => `${jahr}-${kalenderwoche}`;
const euro = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

function KostenSumme({ label, summe, ohnePreis, einheit }: { label: string; summe: number; ohnePreis: number; einheit: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 rounded-lg border border-line bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        {ohnePreis > 0 && <p className="text-xs text-warn">{ohnePreis} {einheit} ohne Preis — nicht in der Summe enthalten.</p>}
      </div>
      <p className="font-display text-2xl font-semibold text-basil">{euro(summe)}</p>
    </div>
  );
}

/** Bedarfs-Rollup über bestätigte Bestellungen: Kalenderwoche → Rezepte (wie viele Einrichtungen/
 * Portionen je Gericht) → auf Klick der Zutaten-Gesamtbedarf für die Lieferantenbestellung. Ergänzt
 * die bestehende, lieferantenweise Einkaufsliste unten (ProcurementBoard) um den schnellen Überblick,
 * den ein Chef direkt nach dem Bestätigen von Bestellungen braucht — ohne dafür erst für jeden Tag
 * einen Produktionsplan anlegen zu müssen. */
export function ProcurementWeekOverview() {
  const wochen = useEinkaufsWochen();
  const [offeneWoche, setOffeneWoche] = useState<string | null>(null);
  const [ansicht, setAnsicht] = useState<"rezepte" | "zutaten">("rezepte");
  const aktiveWoche = wochen.find((w) => weekKey(w.jahr, w.kalenderwoche) === offeneWoche);

  const rezepte = useWochenRezeptBedarf(ansicht === "rezepte" ? aktiveWoche?.jahr : undefined, ansicht === "rezepte" ? aktiveWoche?.kalenderwoche : undefined);
  const zutaten = useWochenZutatBedarf(ansicht === "zutaten" ? aktiveWoche?.jahr : undefined, ansicht === "zutaten" ? aktiveWoche?.kalenderwoche : undefined);

  function toggleWoche(jahr: number, kalenderwoche: number) {
    const key = weekKey(jahr, kalenderwoche);
    setOffeneWoche((aktuell) => (aktuell === key ? null : key));
    setAnsicht("rezepte");
  }

  return (
    <Card className="mb-6">
      <CardHeader
        title="Bedarf aus bestätigten Bestellungen"
        hint="Je Kalenderwoche: welche Rezepte und wie viele Einrichtungen dahinterstehen — und mit einem Klick die dafür nötige Zutatenmenge."
      />
      {wochen.length === 0 ? (
        <EmptyState title="Keine bestätigten Bestellungen" text="Sobald Bestellungen bestätigt wurden, erscheint hier der Zutatenbedarf je Kalenderwoche." />
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {wochen.map((woche) => {
            const key = weekKey(woche.jahr, woche.kalenderwoche);
            const offen = offeneWoche === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => toggleWoche(woche.jahr, woche.kalenderwoche)}
                  aria-expanded={offen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-paper"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-ink">Kalenderwoche {woche.kalenderwoche} / {woche.jahr}</p>
                    <p className="text-xs text-muted">{woche.bestaetigteBestellungen} bestätigte {woche.bestaetigteBestellungen === 1 ? "Bestellung" : "Bestellungen"} · {woche.portionenGesamt} Portionen gesamt</p>
                  </div>
                  {offen ? <ChevronUp size={18} className="shrink-0" aria-hidden /> : <ChevronDown size={18} className="shrink-0" aria-hidden />}
                </button>
                {offen ? (
                  <div className="border-t border-line bg-paper/50 px-5 py-5">
                    <div className="mb-4 flex items-center gap-1.5">
                      <Button icon={UtensilsCrossed} label="Rezepte" variant="ghost" size="sm" pressed={ansicht === "rezepte"} onClick={() => setAnsicht("rezepte")} showLabel />
                      <Button icon={PackageSearch} label="Zutaten-Detail" variant="ghost" size="sm" pressed={ansicht === "zutaten"} onClick={() => setAnsicht("zutaten")} showLabel />
                    </div>
                    {ansicht === "rezepte" ? (
                      rezepte.length === 0 ? (
                        <p className="text-sm text-muted">Keine Rezepte gefunden.</p>
                      ) : (
                        <>
                          <KostenSumme
                            label="Voraussichtliche Kosten (Rezeptpreis × Portionen)"
                            summe={rezepte.reduce((s, r) => s + (r.kostenGesamt ?? 0), 0)}
                            ohnePreis={rezepte.filter((r) => r.kostenGesamt == null).length}
                            einheit="Rezepte"
                          />
                          <Table head={["Rezept", "Portionen gesamt", "Einrichtungen", "Preis / Portion", "Kosten gesamt"]}>
                            {rezepte.map((r) => (
                              <tr key={r.rezeptId}>
                                <Td>
                                  <Link href={`/admin/recipes/${r.rezeptId}`} className="font-medium text-basil hover:underline">{r.rezeptName}</Link>
                                </Td>
                                <Td>{r.portionenGesamt.toLocaleString("de-DE")}</Td>
                                <Td>{r.einrichtungenAnzahl}</Td>
                                <Td className="whitespace-nowrap">
                                  {r.preisProPortion != null ? <>{euro(r.preisProPortion)}{r.preisManuell && <span className="ml-1.5 text-[11px] text-muted">manuell</span>}</> : <span className="text-muted">kein Preis</span>}
                                </Td>
                                <Td className="whitespace-nowrap font-medium text-ink">{r.kostenGesamt != null ? euro(r.kostenGesamt) : <span className="font-normal text-muted">—</span>}</Td>
                              </tr>
                            ))}
                          </Table>
                        </>
                      )
                    ) : zutaten.length === 0 ? (
                      <p className="text-sm text-muted">Keine Zutaten gefunden.</p>
                    ) : (
                      <>
                        <KostenSumme
                          label="Voraussichtlicher Wareneinsatz (Menge × Zutatenpreis)"
                          summe={zutaten.reduce((s, z) => s + (z.kostenGesamt ?? 0), 0)}
                          ohnePreis={zutaten.filter((z) => z.kostenGesamt == null).length}
                          einheit="Zutaten"
                        />
                        <Table head={["Zutat", "Kategorie", "Gesamtmenge", "Preis", "Kosten", "Lagerort", "Verwendet in"]}>
                          {zutaten.map((z) => (
                            <tr key={`${z.zutatId}-${z.einheit}`}>
                              <Td>
                                <Link href={`/admin/ingredients/${z.zutatId}`} className="font-medium text-basil hover:underline">{z.zutatName}</Link>
                              </Td>
                              <Td className="text-muted">{z.kategorie}</Td>
                              <Td className="whitespace-nowrap">{z.gesamtmenge.toLocaleString("de-DE")} {z.einheit}</Td>
                              <Td className="whitespace-nowrap">
                                {z.preis != null ? (
                                  <>
                                    {euro(z.preis)}<span className="text-muted"> / {z.preisEinheit}</span>
                                    <span className="block text-[11px] text-muted">{z.lieferantName ?? "Standardpreis"}</span>
                                  </>
                                ) : <span className="text-muted">kein Preis</span>}
                              </Td>
                              <Td className="whitespace-nowrap font-medium text-ink">
                                {z.kostenGesamt != null ? euro(z.kostenGesamt) : z.preis != null ? <span className="font-normal text-xs text-muted">Einheit nicht umrechenbar</span> : <span className="font-normal text-muted">—</span>}
                              </Td>
                              <Td className="text-muted">{z.lagerort ?? "—"}</Td>
                              <Td className="text-xs text-muted">{z.verwendetIn.join(", ")}</Td>
                            </tr>
                          ))}
                        </Table>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

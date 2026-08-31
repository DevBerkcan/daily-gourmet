"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PackageSearch, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader, Table, Td, Button, EmptyState } from "@/components/ui";
import { useEinkaufsWochen, useWochenRezeptBedarf, useWochenZutatBedarf } from "@/lib/services/procurement-overview";

const weekKey = (jahr: number, kalenderwoche: number) => `${jahr}-${kalenderwoche}`;

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
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-paper"
                >
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">Kalenderwoche {woche.kalenderwoche} / {woche.jahr}</p>
                    <p className="text-xs text-muted">{woche.bestaetigteBestellungen} bestätigte {woche.bestaetigteBestellungen === 1 ? "Bestellung" : "Bestellungen"} · {woche.portionenGesamt} Portionen gesamt</p>
                  </div>
                  {offen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
                </button>
                {offen ? (
                  <div className="border-t border-line bg-paper/50 px-5 py-5">
                    <div className="mb-4 flex gap-2">
                      <Button variant={ansicht === "rezepte" ? "primary" : "secondary"} onClick={() => setAnsicht("rezepte")}>
                        <UtensilsCrossed size={15} aria-hidden /> Rezepte
                      </Button>
                      <Button variant={ansicht === "zutaten" ? "primary" : "secondary"} onClick={() => setAnsicht("zutaten")}>
                        <PackageSearch size={15} aria-hidden /> Zutaten-Detail
                      </Button>
                    </div>
                    {ansicht === "rezepte" ? (
                      rezepte.length === 0 ? (
                        <p className="text-sm text-muted">Keine Rezepte gefunden.</p>
                      ) : (
                        <Table head={["Rezept", "Portionen gesamt", "Einrichtungen"]}>
                          {rezepte.map((r) => (
                            <tr key={r.rezeptId}>
                              <Td className="font-medium text-ink">{r.rezeptName}</Td>
                              <Td>{r.portionenGesamt.toLocaleString("de-DE")}</Td>
                              <Td>{r.einrichtungenAnzahl}</Td>
                            </tr>
                          ))}
                        </Table>
                      )
                    ) : zutaten.length === 0 ? (
                      <p className="text-sm text-muted">Keine Zutaten gefunden.</p>
                    ) : (
                      <Table head={["Zutat", "Kategorie", "Gesamtmenge", "Lagerort", "Verwendet in"]}>
                        {zutaten.map((z) => (
                          <tr key={z.zutatId}>
                            <Td className="font-medium text-ink">{z.zutatName}</Td>
                            <Td className="text-muted">{z.kategorie}</Td>
                            <Td>{z.gesamtmenge.toLocaleString("de-DE")} {z.einheit}</Td>
                            <Td className="text-muted">{z.lagerort ?? "—"}</Td>
                            <Td className="text-xs text-muted">{z.verwendetIn.join(", ")}</Td>
                          </tr>
                        ))}
                      </Table>
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

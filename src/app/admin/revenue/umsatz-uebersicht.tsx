"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, StatCard, Table, Td } from "@/components/ui";
import { umsatzUebersicht } from "@/lib/data";

const EUR = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function UmsatzUebersicht() {
  const zeilen = useMemo(() => umsatzUebersicht(), []);

  const wochen = useMemo(() => {
    const map = new Map<string, { key: string; label: string; jahr: number; kalenderwoche: number }>();
    zeilen.forEach((z) => {
      const key = `${z.jahr}-${z.kalenderwoche}`;
      if (!map.has(key)) map.set(key, { key, label: `KW ${z.kalenderwoche} / ${z.jahr}`, jahr: z.jahr, kalenderwoche: z.kalenderwoche });
    });
    return [...map.values()].sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche);
  }, [zeilen]);

  const [zeitraum, setZeitraum] = useState("alle");

  const gefiltert = zeitraum === "alle" ? zeilen : zeilen.filter((z) => `${z.jahr}-${z.kalenderwoche}` === zeitraum);

  const gesamtUmsatz = gefiltert.reduce((s, z) => s + z.umsatz, 0);
  const gesamtPortionen = gefiltert.reduce((s, z) => s + z.portionen, 0);
  const anzahlWochen = new Set(gefiltert.map((z) => `${z.jahr}-${z.kalenderwoche}`)).size;
  const anzahlEinrichtungen = new Set(gefiltert.map((z) => z.einrichtungId)).size;
  const umsatzJeWoche = anzahlWochen > 0 ? gesamtUmsatz / anzahlWochen : 0;

  const balken = useMemo(() => {
    const map = new Map<string, { label: string; jahr: number; kalenderwoche: number; umsatz: number }>();
    gefiltert.forEach((z) => {
      const key = `${z.jahr}-${z.kalenderwoche}`;
      const eintrag = map.get(key) ?? { label: `KW ${z.kalenderwoche} / ${z.jahr}`, jahr: z.jahr, kalenderwoche: z.kalenderwoche, umsatz: 0 };
      eintrag.umsatz += z.umsatz;
      map.set(key, eintrag);
    });
    return [...map.values()].sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche);
  }, [gefiltert]);
  const maxUmsatz = Math.max(1, ...balken.map((b) => b.umsatz));

  return (
    <>
      <div className="mb-4 flex items-center justify-end no-print">
        <select
          aria-label="Zeitraum wählen"
          value={zeitraum}
          onChange={(e) => setZeitraum(e.target.value)}
          className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
        >
          <option value="alle">Alle Wochen</option>
          {wochen.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
        </select>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Umsatz" value={EUR(gesamtUmsatz)} hint={zeitraum === "alle" ? `über ${anzahlWochen} Wochen` : "gewählte Woche"} />
        <StatCard label="Ø Umsatz je Woche" value={EUR(umsatzJeWoche)} />
        <StatCard label="Abgerechnete Portionen" value={gesamtPortionen.toLocaleString("de-DE")} />
        <StatCard label="Einrichtungen" value={String(anzahlEinrichtungen)} />
      </div>

      <Card className="mb-6">
        <CardHeader title="Umsatz je Kalenderwoche" hint="Nur Bestellungen mit Status Abgesendet/Bestätigt/Gesperrt" />
        <div className="flex flex-col gap-2.5 px-5 py-4">
          {balken.map((b) => (
            <div key={`${b.jahr}-${b.kalenderwoche}`} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-muted">{b.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-paper">
                <div className="h-full rounded-r bg-basil" style={{ width: `${Math.max(2, (b.umsatz / maxUmsatz) * 100)}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-medium text-ink">{EUR(b.umsatz)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Umsatz je Bestellung" />
        <Table head={["Woche", "Einrichtung", "Standort", "Portionen", "Preis/Portion", "Umsatz"]}>
          {gefiltert.map((z) => (
            <tr key={z.bestellungId} className="hover:bg-paper">
              <Td className="text-muted">KW {z.kalenderwoche} / {z.jahr}</Td>
              <Td className="font-medium text-ink">{z.einrichtungName}</Td>
              <Td className="text-muted">{z.standortName}</Td>
              <Td>{z.portionen.toLocaleString("de-DE")}</Td>
              <Td className="text-muted">{EUR(z.portionspreis)}</Td>
              <Td className="font-semibold text-basil">{EUR(z.umsatz)}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Download, Printer, Send } from "lucide-react";
import { Button, Card, CardHeader, EmptyState, StatCard, StatusBadge, Table, Td } from "@/components/ui";
import {
  useEinkaufslisten,
  useUpdateEinkaufsmenge,
  useUpdateEinkaufslistenStatus,
  exportEinkaufslisteCsv,
  type EinkaufslistenStatus,
} from "@/lib/services/procurement";
import { useZutaten } from "@/lib/services/ingredients";

const NEXT_STATUS: Record<EinkaufslistenStatus, EinkaufslistenStatus | null> = {
  DRAFT: "REVIEWED",
  REVIEWED: "ORDERED",
  ORDERED: "COMPLETED",
  COMPLETED: null,
};

export function ProcurementBoard() {
  const listen = useEinkaufslisten();
  const zutaten = useZutaten();
  const updateMenge = useUpdateEinkaufsmenge();
  const updateStatus = useUpdateEinkaufslistenStatus();
  const [bearbeiteteMengen, setBearbeiteteMengen] = useState<Record<string, number>>({});

  const aktuelle = listen[0];
  if (!aktuelle) {
    return <Card><EmptyState title="Keine Einkaufsliste vorhanden" text="Für den aktuellen Standort wurde noch keine Bedarfsliste aus einem Produktionsplan erzeugt." /></Card>;
  }

  const mengeFuer = (position: (typeof aktuelle.positionen)[number]) => bearbeiteteMengen[position.id] ?? position.einkaufsmenge;
  const gesamtwert = aktuelle.positionen.reduce((summe, position) => summe + mengeFuer(position) * (zutaten.find((z) => z.id === position.zutatId)?.einkaufspreis ?? 0), 0);
  const naechsterStatus = NEXT_STATUS[aktuelle.status];

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Artikelpositionen" value={String(aktuelle.positionen.length)} /><StatCard label="Lieferanten" value={String(new Set(aktuelle.positionen.map((position) => position.lieferant)).size)} /><StatCard label="Voraussichtlicher Bestellwert" value={gesamtwert.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} tone="warn" /></div>
      <Card>
        <CardHeader title={aktuelle.bezeichnung} hint={`${aktuelle.standortName} · Kalenderwoche ${aktuelle.kalenderwoche}`} actions={<StatusBadge status={aktuelle.status} />} />
        <div className="flex flex-wrap justify-end gap-2 border-b border-line px-5 py-3 no-print">
          <Button variant="secondary" onClick={() => exportEinkaufslisteCsv(aktuelle.id, `einkauf-kw-${aktuelle.kalenderwoche}.csv`)}><Download size={15} aria-hidden /> CSV-Export</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button>
        </div>
        <Table head={["Zutat", "Gesamtbedarf", "Bestellmenge", "Preis", "Lieferant"]}>
          {aktuelle.positionen.map((position) => {
            const zutat = zutaten.find((z) => z.id === position.zutatId);
            const menge = mengeFuer(position);
            return (
              <tr key={position.id}>
                <Td><p className="font-semibold text-ink">{position.zutatName}</p><p className="text-xs text-muted">{position.artikelnummer}</p></Td>
                <Td>{position.gesamtmengeBasis.toLocaleString("de-DE")} {position.einheit}</Td>
                <Td>
                  <label className="flex items-center gap-2">
                    <span className="sr-only">Bestellmenge {position.zutatName}</span>
                    <input
                      type="number"
                      min="0"
                      value={menge}
                      onChange={(event) => setBearbeiteteMengen((aktuell) => ({ ...aktuell, [position.id]: Math.max(0, Number(event.target.value) || 0) }))}
                      onBlur={() => { if (bearbeiteteMengen[position.id] !== undefined) updateMenge.mutate({ listeId: aktuelle.id, positionId: position.id, menge: bearbeiteteMengen[position.id] }); }}
                      disabled={aktuelle.status === "ORDERED" || aktuelle.status === "COMPLETED"}
                      className="min-h-9 w-20 rounded-lg border border-line bg-surface px-2 text-right text-sm disabled:bg-line"
                    />
                  </label>
                </Td>
                <Td>{(menge * (zutat?.einkaufspreis ?? 0)).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td>
                <Td className="text-muted">{position.lieferant ?? "—"}</Td>
              </tr>
            );
          })}
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
          <div><p className="text-sm text-muted">Bestellwert gesamt</p><p className="font-display text-2xl font-semibold text-basil">{gesamtwert.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</p></div>
          {naechsterStatus ? (
            <Button onClick={() => updateStatus.mutate({ id: aktuelle.id, status: naechsterStatus })}>
              {naechsterStatus === "REVIEWED" ? <><CheckCircle2 size={16} aria-hidden /> Als geprüft markieren</> : naechsterStatus === "ORDERED" ? <><Send size={16} aria-hidden /> Bestellung auslösen</> : <><CheckCircle2 size={16} aria-hidden /> Lieferung abschließen</>}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ok"><CheckCircle2 size={17} aria-hidden />Abgeschlossen</span>
          )}
        </div>
      </Card>
      {listen.length > 1 && (
        <Card className="mt-6"><CardHeader title="Frühere Listen" /><Table head={["Bezeichnung", "KW", "Standort", "Status"]}>{listen.slice(1).map((liste) => <tr key={liste.id}><Td className="font-medium text-ink">{liste.bezeichnung}</Td><Td>{liste.kalenderwoche}</Td><Td className="text-muted">{liste.standortName}</Td><Td><StatusBadge status={liste.status} /></Td></tr>)}</Table></Card>
      )}
    </>
  );
}

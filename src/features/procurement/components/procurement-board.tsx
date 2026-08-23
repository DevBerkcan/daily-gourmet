"use client";

import { useState } from "react";
import { CheckCircle2, Download, Printer, Send } from "lucide-react";
import { Button, Card, CardHeader, EmptyState, StatCard, StatusBadge, Table, Td, Tag } from "@/components/ui";
import {
  useEinkaufslisten,
  useUpdateEinkaufsmenge,
  useUpdateEinkaufslistenStatus,
  exportEinkaufsliste,
  type EinkaufslistenStatus,
} from "@/lib/services/procurement";
import { useZutaten } from "@/lib/services/ingredients";

const NEXT_STATUS: Record<EinkaufslistenStatus, EinkaufslistenStatus | null> = {
  DRAFT: "REVIEWED",
  REVIEWED: "READY_FOR_APPROVAL",
  READY_FOR_APPROVAL: "APPROVED",
  APPROVED: "ORDERED",
  ORDERED: "COMPLETED",
  COMPLETED: null,
};
const STATUS_AKTION_LABEL: Record<EinkaufslistenStatus, string> = {
  DRAFT: "Als geprüft markieren",
  REVIEWED: "Zur Freigabe senden",
  READY_FOR_APPROVAL: "Freigeben",
  APPROVED: "Bestellung auslösen",
  ORDERED: "Lieferung abschließen",
  COMPLETED: "",
};

export function ProcurementBoard() {
  const listen = useEinkaufslisten();
  const zutaten = useZutaten();
  const updateMenge = useUpdateEinkaufsmenge();
  const updateStatus = useUpdateEinkaufslistenStatus();
  const [bearbeiteteMengen, setBearbeiteteMengen] = useState<Record<string, number>>({});
  const [ausgewaehlteId, setAusgewaehlteId] = useState<string | null>(null);

  if (listen.length === 0) {
    return <Card><EmptyState title="Keine Einkaufsliste vorhanden" text="Für den aktuellen Standort wurde noch keine Bedarfsliste aus einem Produktionsplan erzeugt." /></Card>;
  }
  const aktuelleWoche = listen[0].kalenderwoche;
  const listenDieserWoche = listen.filter((l) => l.kalenderwoche === aktuelleWoche);
  const aeltereListen = listen.filter((l) => l.kalenderwoche !== aktuelleWoche);
  const aktuelle = listenDieserWoche.find((l) => l.id === ausgewaehlteId) ?? listenDieserWoche[0];

  const mengeFuer = (position: (typeof aktuelle.positionen)[number]) => bearbeiteteMengen[position.id] ?? position.einkaufsmenge;
  const gesamtwert = aktuelle.positionen.reduce((summe, position) => summe + mengeFuer(position) * (zutaten.find((z) => z.id === position.zutatId)?.einkaufspreis ?? 0), 0);
  const naechsterStatus = NEXT_STATUS[aktuelle.status];

  return (
    <>
      {listenDieserWoche.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2 no-print">
          {listenDieserWoche.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setAusgewaehlteId(l.id)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium ${l.id === aktuelle.id ? "border-basil bg-basil-soft text-basil" : "border-line bg-surface text-ink-soft hover:bg-paper"}`}
            >
              {l.lieferantName ?? "Ohne Lieferant"}
            </button>
          ))}
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Artikelpositionen" value={String(aktuelle.positionen.length)} /><StatCard label="Lieferant" value={aktuelle.lieferantName ?? "—"} /><StatCard label="Voraussichtlicher Bestellwert" value={gesamtwert.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} tone="warn" /></div>
      <Card>
        <CardHeader
          title={aktuelle.bezeichnung}
          hint={`${aktuelle.standortName} · Kalenderwoche ${aktuelle.kalenderwoche}`}
          actions={<><StatusBadge status={aktuelle.status} />{aktuelle.lieferantName && <Tag>{aktuelle.lieferantName}</Tag>}</>}
        />
        <div className="flex flex-wrap justify-end gap-2 border-b border-line px-5 py-3 no-print">
          <Button variant="secondary" onClick={() => exportEinkaufsliste(aktuelle.id, "csv", `einkauf-kw-${aktuelle.kalenderwoche}.csv`)}><Download size={15} aria-hidden /> CSV-Export</Button>
          <Button variant="secondary" onClick={() => exportEinkaufsliste(aktuelle.id, "pdf", `einkauf-kw-${aktuelle.kalenderwoche}.pdf`)}><Download size={15} aria-hidden /> PDF-Export</Button>
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
          {aktuelle.status === "READY_FOR_APPROVAL" && (
            <p className="text-xs text-muted">Armin wurde per E-Mail zur Freigabe eingeladen — er kann alternativ auch hier direkt freigeben.</p>
          )}
          {naechsterStatus ? (
            <Button onClick={() => updateStatus.mutate({ id: aktuelle.id, status: naechsterStatus })}>
              {naechsterStatus === "ORDERED" || naechsterStatus === "READY_FOR_APPROVAL" ? <Send size={16} aria-hidden /> : <CheckCircle2 size={16} aria-hidden />} {STATUS_AKTION_LABEL[aktuelle.status]}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ok"><CheckCircle2 size={17} aria-hidden />Abgeschlossen</span>
          )}
        </div>
      </Card>
      {aeltereListen.length > 0 && (
        <Card className="mt-6"><CardHeader title="Frühere Listen" /><Table head={["Bezeichnung", "KW", "Standort", "Lieferant", "Status"]}>{aeltereListen.map((liste) => <tr key={liste.id}><Td className="font-medium text-ink">{liste.bezeichnung}</Td><Td>{liste.kalenderwoche}</Td><Td className="text-muted">{liste.standortName}</Td><Td className="text-muted">{liste.lieferantName ?? "—"}</Td><Td><StatusBadge status={liste.status} /></Td></tr>)}</Table></Card>
      )}
    </>
  );
}

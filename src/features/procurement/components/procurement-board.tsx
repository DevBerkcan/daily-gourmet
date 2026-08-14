"use client";

import { useState } from "react";
import { CheckCircle2, Download, Printer, Send } from "lucide-react";
import { Button, Card, CardHeader, StatCard, StatusBadge, Table, Td } from "@/components/ui";
import { standortById } from "@/lib/data";
import { einkaufslisten } from "../data";
import { zutatById } from "@/features/ingredients/data";
import type { EinkaufslistenStatus } from "../types";

export function ProcurementBoard() {
  const aktuelle = einkaufslisten[0];
  const [status, setStatus] = useState<EinkaufslistenStatus>(aktuelle.status);
  const [mengen, setMengen] = useState<Record<string, number>>(() => Object.fromEntries(aktuelle.positionen.map((position) => [position.zutatId, position.einkaufsmenge])));
  const gesamtwert = aktuelle.positionen.reduce((summe, position) => summe + (mengen[position.zutatId] ?? 0) * (zutatById(position.zutatId)?.einkaufspreis ?? 0), 0);

  function csvExportieren() {
    const zeilen = [["Artikelnummer", "Zutat", "Bedarf", "Einheit", "Bestellmenge", "Lieferant"], ...aktuelle.positionen.map((position) => { const zutat = zutatById(position.zutatId); return [zutat?.artikelnummer ?? "", zutat?.name ?? "", position.gesamtmengeBasis, zutat?.basiseinheit ?? "", mengen[position.zutatId] ?? 0, zutat?.lieferant ?? ""]; })];
    const csv = zeilen.map((zeile) => zeile.map((wert) => `"${String(wert).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `einkauf-kw-${aktuelle.kalenderwoche}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Artikelpositionen" value={String(aktuelle.positionen.length)} /><StatCard label="Lieferanten" value={String(new Set(aktuelle.positionen.map((position) => zutatById(position.zutatId)?.lieferant)).size)} /><StatCard label="Voraussichtlicher Bestellwert" value={gesamtwert.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} tone="warn" /></div>
      <Card><CardHeader title={aktuelle.bezeichnung} hint={`${standortById(aktuelle.standortId)?.name} · Kalenderwoche ${aktuelle.kalenderwoche}`} actions={<StatusBadge status={status} />} /><div className="flex flex-wrap justify-end gap-2 border-b border-line px-5 py-3 no-print"><Button variant="secondary" onClick={csvExportieren}><Download size={15} aria-hidden /> CSV-Export</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button></div><Table head={["Zutat", "Gesamtbedarf", "Einkaufseinheit", "Bestellmenge", "Preis", "Aus Rezepten", "Lieferant"]}>{aktuelle.positionen.map((position) => { const zutat = zutatById(position.zutatId); if (!zutat) return null; return <tr key={position.zutatId}><Td><p className="font-semibold text-ink">{zutat.name}</p><p className="text-xs text-muted">{zutat.artikelnummer}</p></Td><Td>{position.gesamtmengeBasis.toLocaleString("de-DE")} {zutat.basiseinheit}</Td><Td className="text-muted">{zutat.einkaufseinheit}</Td><Td><label className="flex items-center gap-2"><span className="sr-only">Bestellmenge {zutat.name}</span><input type="number" min="0" value={mengen[position.zutatId] ?? 0} onChange={(event) => setMengen((aktuell) => ({ ...aktuell, [position.zutatId]: Math.max(0, Number(event.target.value) || 0) }))} disabled={status === "ORDERED" || status === "COMPLETED"} className="min-h-9 w-20 rounded-lg border border-line bg-surface px-2 text-right text-sm disabled:bg-line" /><span className="text-muted">×</span></label></Td><Td>{((mengen[position.zutatId] ?? 0) * (zutat.einkaufspreis ?? 0)).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td><Td className="max-w-56 text-xs text-muted">{position.rezepte.join(", ")}</Td><Td className="text-muted">{zutat.lieferant}</Td></tr>; })}</Table><div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4"><div><p className="text-sm text-muted">Bestellwert gesamt</p><p className="font-display text-2xl font-semibold text-basil">{gesamtwert.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</p></div>{status === "DRAFT" ? <Button onClick={() => setStatus("REVIEWED")}><CheckCircle2 size={16} aria-hidden /> Als geprüft markieren</Button> : status === "REVIEWED" ? <Button onClick={() => setStatus("ORDERED")}><Send size={16} aria-hidden /> Bestellung auslösen</Button> : status === "ORDERED" ? <Button onClick={() => setStatus("COMPLETED")}><CheckCircle2 size={16} aria-hidden /> Lieferung abschließen</Button> : <span className="inline-flex items-center gap-2 text-sm font-medium text-ok"><CheckCircle2 size={17} aria-hidden />Abgeschlossen</span>}</div></Card>
      <Card className="mt-6"><CardHeader title="Frühere Listen" /><Table head={["Bezeichnung", "KW", "Standort", "Status"]}>{einkaufslisten.slice(1).map((liste) => <tr key={liste.id}><Td className="font-medium text-ink">{liste.bezeichnung}</Td><Td>{liste.kalenderwoche}</Td><Td className="text-muted">{standortById(liste.standortId)?.name}</Td><Td><StatusBadge status={liste.status} /></Td></tr>)}</Table></Card>
    </>
  );
}

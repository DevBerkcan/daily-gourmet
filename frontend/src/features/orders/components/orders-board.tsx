"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Download, LockKeyhole, Search } from "lucide-react";
import { Button, Card, CardHeader, StatCard, StatusBadge, Table, Td } from "@/components/ui";
import { einrichtungById } from "@/lib/data";
import { speiseplaene } from "@/features/meal-plans/data";
import { updateBestellStatus, useBestellungen } from "../store";
import type { BestellStatus } from "@/lib/types";

const statusOptionen: { value: "ALLE" | BestellStatus; label: string }[] = [
  { value: "ALLE", label: "Alle Status" }, { value: "DRAFT", label: "Entwurf" }, { value: "SUBMITTED", label: "Abgesendet" }, { value: "CONFIRMED", label: "Bestätigt" }, { value: "LOCKED", label: "Gesperrt" }, { value: "CANCELLED", label: "Storniert" },
];

export function OrdersBoard() {
  const bestellungen = useBestellungen();
  const [suche, setSuche] = useState("");
  const [status, setStatus] = useState<"ALLE" | BestellStatus>("ALLE");
  const [korrekturId, setKorrekturId] = useState<string | null>(null);
  const [begruendung, setBegruendung] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const verbindlich = bestellungen.filter((bestellung) => ["SUBMITTED", "CONFIRMED", "LOCKED"].includes(bestellung.status));
  const portionen = verbindlich.reduce((summe, bestellung) => summe + bestellung.positionen.reduce((teil, position) => teil + position.portionen, 0), 0);
  const gefiltert = bestellungen.filter((bestellung) => {
    const einrichtung = einrichtungById(bestellung.einrichtungId);
    return (status === "ALLE" || bestellung.status === status) && `${einrichtung?.name} ${bestellung.id}`.toLowerCase().includes(suche.toLowerCase());
  });

  function csvExportieren() {
    const zeilen = [["Bestellung", "Einrichtung", "Status", "Portionen", "Frist"], ...gefiltert.map((bestellung) => [bestellung.id, einrichtungById(bestellung.einrichtungId)?.name ?? "", bestellung.status, bestellung.positionen.reduce((summe, position) => summe + position.portionen, 0), bestellung.frist])];
    const csv = zeilen.map((zeile) => zeile.map((wert) => `"${String(wert).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "bestellungen.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bestellungen gesamt" value={String(bestellungen.length)} />
        <StatCard label="Verbindliche Portionen" value={String(portionen)} tone="ok" />
        <StatCard label="Zur Bestätigung" value={String(bestellungen.filter((bestellung) => bestellung.status === "SUBMITTED").length)} tone="warn" />
        <StatCard label="Offene Entwürfe" value={String(bestellungen.filter((bestellung) => bestellung.status === "DRAFT").length)} hint="Fristerinnerung senden" />
      </div>

      {meldung ? <p className="mt-4 rounded-lg bg-ok-soft px-4 py-3 text-sm font-medium text-ok">{meldung}</p> : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <label className="relative min-w-56 flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted" aria-hidden /><span className="sr-only">Bestellung suchen</span><input type="search" value={suche} onChange={(event) => setSuche(event.target.value)} placeholder="Einrichtung oder Bestellnummer suchen …" className="min-h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value as "ALLE" | BestellStatus)} aria-label="Bestellstatus filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">{statusOptionen.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <Button variant="secondary" onClick={csvExportieren}><Download size={15} aria-hidden /> CSV exportieren</Button>
        </div>
        <Table head={["Bestellung & Einrichtung", "Woche", "Portionen", "Status", "Abgesendet", "Frist", "Aktion"]}>
          {gefiltert.map((bestellung) => {
            const plan = speiseplaene.find((eintrag) => eintrag.id === bestellung.speiseplanId);
            const gesamt = bestellung.positionen.reduce((summe, position) => summe + position.portionen, 0);
            const istEntwurf = bestellung.status === "DRAFT";
            return <tr key={bestellung.id} className="hover:bg-paper"><Td><p className="font-semibold text-ink">{einrichtungById(bestellung.einrichtungId)?.name}</p><p className="mt-0.5 text-xs text-muted">{bestellung.id}</p></Td><Td>KW {plan?.kalenderwoche ?? "—"}</Td><Td className="font-display text-lg font-semibold text-basil">{gesamt}</Td><Td><StatusBadge status={bestellung.status} /></Td><Td className="text-muted">{bestellung.abgesendetAm ?? "—"}</Td><Td><span className={`inline-flex items-center gap-1.5 text-xs ${istEntwurf ? "font-medium text-warn" : "text-muted"}`}><Clock3 size={14} aria-hidden />{bestellung.frist}</span>{istEntwurf ? <p className="mt-1 text-xs text-warn">Noch nicht abgesendet</p> : null}</Td><Td><div className="flex flex-wrap gap-2">{bestellung.status === "SUBMITTED" ? <Button onClick={() => updateBestellStatus(bestellung.id, "CONFIRMED")}><CheckCircle2 size={15} aria-hidden /> Bestätigen</Button> : null}{bestellung.status === "CONFIRMED" ? <Button variant="secondary" onClick={() => updateBestellStatus(bestellung.id, "LOCKED")}><LockKeyhole size={15} aria-hidden /> Sperren</Button> : null}{bestellung.status === "LOCKED" ? <Button variant="secondary" onClick={() => setKorrekturId(bestellung.id)}>Korrektur</Button> : null}{bestellung.status === "DRAFT" ? <Button variant="ghost" onClick={() => setMeldung(`Fristerinnerung an ${einrichtungById(bestellung.einrichtungId)?.name} wurde vorgemerkt.`)}>Erinnerung senden</Button> : null}</div></Td></tr>;
          })}
        </Table>
      </Card>

      {korrekturId ? <Card className="mt-6 border-warn/40"><CardHeader title="Nachträgliche Korrektur freigeben" hint="Korrekturen nach Fristablauf werden mit Begründung protokolliert." actions={<AlertTriangle size={19} className="text-warn" aria-hidden />} /><div className="p-5"><label className="block text-xs font-medium text-muted">Begründung<textarea value={begruendung} onChange={(event) => setBegruendung(event.target.value)} rows={3} placeholder="z. B. telefonische Korrektur der Einrichtung" className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-sm" /></label><div className="mt-4 flex gap-2"><Button disabled={!begruendung.trim()} onClick={() => { updateBestellStatus(korrekturId, "CONFIRMED"); setKorrekturId(null); setBegruendung(""); }}>Korrektur freigeben</Button><Button variant="secondary" onClick={() => { setKorrekturId(null); setBegruendung(""); }}>Abbrechen</Button></div></div></Card> : null}
    </>
  );
}

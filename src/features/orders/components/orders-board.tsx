"use client";

import { useState } from "react";
import { AlertTriangle, BellRing, Clock3, Search } from "lucide-react";
import { ACTION_ICONS, Button, Card, CardHeader, StatCard, StatusBadge, Table, Td, Pagination } from "@/components/ui";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useSpeiseplaene } from "@/lib/services/meal-plans";
import { useRezepte } from "@/lib/services/recipes";
import { useBestellungen, useConfirmBestellung, useLockBestellung, useOverrideBestellung } from "@/lib/services/orders";
import { usePagination } from "@/lib/use-pagination";
import type { BestellStatus, Bestellung } from "@/lib/types";
import { BestellungDetailModal } from "./bestellung-detail-modal";

const statusOptionen: { value: "ALLE" | BestellStatus; label: string }[] = [
  { value: "ALLE", label: "Alle Status" }, { value: "DRAFT", label: "Entwurf" }, { value: "SUBMITTED", label: "Abgesendet" }, { value: "CONFIRMED", label: "Bestätigt" }, { value: "LOCKED", label: "Gesperrt" }, { value: "CANCELLED", label: "Storniert" },
];

export function OrdersBoard() {
  const speiseplaene = useSpeiseplaene();
  const [kalenderwoche, setKalenderwoche] = useState<"ALLE" | number>("ALLE");
  const bestellungen = useBestellungen(kalenderwoche === "ALLE" ? undefined : { kalenderwoche });
  const einrichtungen = useEinrichtungen();
  const rezepte = useRezepte();
  const confirmBestellung = useConfirmBestellung();
  const lockBestellung = useLockBestellung();
  const overrideBestellung = useOverrideBestellung();
  const [suche, setSuche] = useState("");
  const [status, setStatus] = useState<"ALLE" | BestellStatus>("ALLE");
  const verfuegbareWochen = Array.from(new Set(speiseplaene.map((p) => p.kalenderwoche))).sort((a, b) => a - b);
  const [korrekturId, setKorrekturId] = useState<string | null>(null);
  const [begruendung, setBegruendung] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [detailBestellung, setDetailBestellung] = useState<Bestellung | null>(null);
  const einrichtungById = (id: string) => einrichtungen.find((e) => e.id === id);
  const verbindlich = bestellungen.filter((bestellung) => ["SUBMITTED", "CONFIRMED", "LOCKED"].includes(bestellung.status));
  const portionen = verbindlich.reduce((summe, bestellung) => summe + bestellung.positionen.reduce((teil, position) => teil + position.portionen, 0), 0);
  const gefiltert = bestellungen.filter((bestellung) => {
    const einrichtung = einrichtungById(bestellung.einrichtungId);
    return (status === "ALLE" || bestellung.status === status) && `${einrichtung?.name} ${bestellung.id}`.toLowerCase().includes(suche.toLowerCase());
  });
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

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
          <select value={kalenderwoche} onChange={(event) => setKalenderwoche(event.target.value === "ALLE" ? "ALLE" : Number(event.target.value))} aria-label="Kalenderwoche filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="ALLE">Alle Kalenderwochen</option>
            {verfuegbareWochen.map((w) => <option key={w} value={w}>KW {w}</option>)}
          </select>
          <Button icon={ACTION_ICONS.download} label="CSV exportieren" variant="secondary" onClick={csvExportieren} showLabel />
        </div>
        <Table head={["Bestellung & Einrichtung", "Woche", "Portionen", "Status", "Abgesendet", "Frist", "Aktion"]}>
          {pageItems.map((bestellung) => {
            const plan = speiseplaene.find((eintrag) => eintrag.id === bestellung.speiseplanId);
            const gesamt = bestellung.positionen.reduce((summe, position) => summe + position.portionen, 0);
            const istEntwurf = bestellung.status === "DRAFT";
            return <tr key={bestellung.id} className="hover:bg-paper"><Td><div className="min-w-0"><button type="button" onClick={() => setDetailBestellung(bestellung)} className="cursor-pointer text-left font-semibold text-ink hover:text-basil hover:underline">{einrichtungById(bestellung.einrichtungId)?.name}</button><p className="mt-0.5 break-all text-xs text-muted">{bestellung.id}</p></div></Td><Td>KW {plan?.kalenderwoche ?? "—"}</Td><Td className="font-display text-lg font-semibold text-basil">{gesamt}</Td><Td><StatusBadge status={bestellung.status} /></Td><Td className="text-muted">{bestellung.abgesendetAm ?? "—"}</Td><Td><span className={`inline-flex items-center gap-1.5 text-xs ${istEntwurf ? "font-medium text-warn" : "text-muted"}`}><Clock3 size={14} aria-hidden />{bestellung.frist}</span>{istEntwurf ? <p className="mt-1 text-xs text-warn">Noch nicht abgesendet</p> : null}</Td><Td><div className="flex flex-wrap items-center gap-1.5"><Button icon={ACTION_ICONS.view} label="Details" variant="ghost" size="sm" onClick={() => setDetailBestellung(bestellung)} />{bestellung.status === "SUBMITTED" ? <Button icon={ACTION_ICONS.confirm} label="Bestätigen" variant="ghost" size="sm" onClick={() => confirmBestellung.mutate(bestellung.id)} /> : null}{bestellung.status === "CONFIRMED" ? <Button icon={ACTION_ICONS.reject} label="Sperren" variant="danger" size="sm" onClick={() => lockBestellung.mutate(bestellung.id)} /> : null}{bestellung.status === "LOCKED" ? <Button icon={ACTION_ICONS.edit} label="Korrektur" variant="ghost" size="sm" onClick={() => setKorrekturId(bestellung.id)} /> : null}{bestellung.status === "DRAFT" ? <Button icon={BellRing} label="Erinnerung senden" variant="ghost" size="sm" onClick={() => setMeldung(`Fristerinnerung an ${einrichtungById(bestellung.einrichtungId)?.name} wurde vorgemerkt.`)} /> : null}</div></Td></tr>;
          })}
        </Table>
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>

      {korrekturId ?<Card className="mt-6 border-warn/40"><CardHeader title="Nachträgliche Korrektur freigeben" hint="Korrekturen nach Fristablauf werden mit Begründung protokolliert." actions={<AlertTriangle size={19} className="text-warn" aria-hidden />} /><div className="p-5"><label className="block text-xs font-medium text-muted">Begründung<textarea value={begruendung} onChange={(event) => setBegruendung(event.target.value)} rows={3} placeholder="z. B. telefonische Korrektur der Einrichtung" className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-sm" /></label><div className="mt-4 flex gap-2"><Button icon={ACTION_ICONS.approve} label="Korrektur freigeben" disabled={!begruendung.trim()} onClick={() => { overrideBestellung.mutate({ id: korrekturId, reason: begruendung }); setKorrekturId(null); setBegruendung(""); }} showLabel /><Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" onClick={() => { setKorrekturId(null); setBegruendung(""); }} showLabel /></div></div></Card> : null}

      {detailBestellung ? (
        <BestellungDetailModal
          bestellung={detailBestellung}
          einrichtung={einrichtungById(detailBestellung.einrichtungId)}
          plan={speiseplaene.find((eintrag) => eintrag.id === detailBestellung.speiseplanId)}
          rezepte={rezepte}
          onClose={() => setDetailBestellung(null)}
        />
      ) : null}
    </>
  );
}

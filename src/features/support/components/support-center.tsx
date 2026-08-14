"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, Clock3, Eye, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Card, CardHeader, StatCard } from "@/components/ui";
import { addSupportAntwort, startSupportSitzung, updateSupportStatus, useSupportEreignisse, useSupportTickets } from "../store";
import type { SupportStatus } from "../types";

const statusLabel: Record<SupportStatus, string> = { OFFEN: "Offen", IN_BEARBEITUNG: "In Bearbeitung", GELOEST: "Gelöst" };
const statusStyle: Record<SupportStatus, string> = { OFFEN: "bg-warn-soft text-warn", IN_BEARBEITUNG: "bg-info-soft text-info", GELOEST: "bg-ok-soft text-ok" };

export function SupportCenter() {
  const router = useRouter();
  const tickets = useSupportTickets();
  const ereignisse = useSupportEreignisse();
  const [auswahlId, setAuswahlId] = useState(tickets[0]?.id ?? "");
  const [filter, setFilter] = useState<"ALLE" | SupportStatus>("ALLE");
  const [antwort, setAntwort] = useState("");
  const ausgewaehlt = tickets.find((ticket) => ticket.id === auswahlId) ?? tickets[0];
  const gefiltert = tickets.filter((ticket) => filter === "ALLE" || ticket.status === filter);

  function antworten(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!ausgewaehlt || !antwort.trim()) return;
    addSupportAntwort(ausgewaehlt.id, antwort.trim(), "SUPER_ADMIN"); setAntwort("");
  }

  function supportStarten() {
    if (!ausgewaehlt) return;
    startSupportSitzung(ausgewaehlt.tenantId, ausgewaehlt.tenantName);
    router.push("/admin/dashboard");
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Offene Anfragen" value={String(tickets.filter((ticket) => ticket.status === "OFFEN").length)} tone="warn" /><StatCard label="In Bearbeitung" value={String(tickets.filter((ticket) => ticket.status === "IN_BEARBEITUNG").length)} /><StatCard label="Heute gelöst" value={String(tickets.filter((ticket) => ticket.status === "GELOEST").length)} tone="ok" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="h-fit"><CardHeader title="Supportanfragen" actions={<select value={filter} onChange={(event) => setFilter(event.target.value as "ALLE" | SupportStatus)} aria-label="Supportstatus filtern" className="min-h-9 rounded-lg border border-line bg-surface px-2 text-xs"><option value="ALLE">Alle</option><option value="OFFEN">Offen</option><option value="IN_BEARBEITUNG">In Bearbeitung</option><option value="GELOEST">Gelöst</option></select>} /><div className="divide-y divide-line">{gefiltert.map((ticket) => <button key={ticket.id} type="button" onClick={() => setAuswahlId(ticket.id)} className={`w-full px-5 py-4 text-left transition-colors ${ticket.id === ausgewaehlt?.id ? "bg-basil-soft" : "hover:bg-paper"}`}><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle[ticket.status]}`}>{statusLabel[ticket.status]}</span><span className="text-[11px] text-muted">{ticket.erstelltAm}</span></div><p className="mt-2 font-semibold text-ink">{ticket.titel}</p><p className="mt-1 line-clamp-2 text-xs text-muted">{ticket.tenantName} · {ticket.id}</p></button>)}</div></Card>
        <div className="flex flex-col gap-6">{ausgewaehlt ? <Card><div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4"><div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[ausgewaehlt.status]}`}>{statusLabel[ausgewaehlt.status]}</span><span className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-muted">{ausgewaehlt.kategorie}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ausgewaehlt.prioritaet === "KRITISCH" || ausgewaehlt.prioritaet === "HOCH" ? "bg-danger-soft text-danger" : "bg-paper text-muted"}`}>{ausgewaehlt.prioritaet}</span></div><h2 className="mt-3 font-display text-2xl font-semibold text-ink">{ausgewaehlt.titel}</h2><p className="mt-1 text-sm text-muted">{ausgewaehlt.tenantName} · {ausgewaehlt.erstelltVon} · {ausgewaehlt.erstelltAm}</p></div><Button onClick={supportStarten}><Eye size={16} aria-hidden /> Im Mandanten prüfen</Button></div><div className="p-5"><div className="rounded-lg bg-paper px-4 py-3"><p className="text-sm leading-relaxed text-ink">{ausgewaehlt.nachricht}</p><p className="mt-2 text-xs text-muted">Gemeldet auf: {ausgewaehlt.seite}</p></div>{ausgewaehlt.antworten.length ? <div className="mt-5 flex flex-col gap-3">{ausgewaehlt.antworten.map((eintrag) => <div key={eintrag.id} className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${eintrag.rolle === "SUPER_ADMIN" ? "ml-auto bg-basil text-white" : "bg-paper text-ink"}`}><p>{eintrag.text}</p><p className={`mt-2 text-[11px] ${eintrag.rolle === "SUPER_ADMIN" ? "text-white/70" : "text-muted"}`}>{eintrag.autor} · {eintrag.zeitpunkt}</p></div>)}</div> : null}<form onSubmit={antworten} className="mt-5 flex gap-2"><label className="sr-only" htmlFor="support-reply">Antwort</label><input id="support-reply" value={antwort} onChange={(event) => setAntwort(event.target.value)} placeholder="Antwort an Tenant Owner …" className="min-h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm" /><Button type="submit" disabled={!antwort.trim()}><Send size={15} aria-hidden /> Senden</Button></form><div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">{ausgewaehlt.status !== "IN_BEARBEITUNG" ? <Button variant="secondary" onClick={() => updateSupportStatus(ausgewaehlt.id, "IN_BEARBEITUNG")}><Clock3 size={15} aria-hidden /> In Bearbeitung</Button> : null}{ausgewaehlt.status !== "GELOEST" ? <Button variant="secondary" onClick={() => updateSupportStatus(ausgewaehlt.id, "GELOEST")}><CheckCircle2 size={15} aria-hidden /> Als gelöst markieren</Button> : null}</div></div></Card> : null}
          <Card><CardHeader title="Live-Aktivität des Mandanten" hint="Hilft, den Ablauf vor und nach einer Supportfrage nachzuvollziehen." /><div className="divide-y divide-line">{ereignisse.filter((ereignis) => !ausgewaehlt || ereignis.tenantId === ausgewaehlt.tenantId).slice(0, 8).map((ereignis) => <div key={ereignis.id} className="flex gap-3 px-5 py-3.5"><span className="mt-1 size-2 shrink-0 rounded-full bg-basil" aria-hidden /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold text-ink">{ereignis.aktion}</p><span className="text-xs text-muted">{ereignis.zeitpunkt}</span></div><p className="mt-0.5 text-xs text-muted">{ereignis.akteur} · {ereignis.detail}</p></div></div>)}</div></Card>
        </div>
      </div>
    </>
  );
}

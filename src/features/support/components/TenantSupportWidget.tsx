"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, LifeBuoy, MessageSquareText, Paperclip, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { useCreateSupportTicket, useSupportTickets, useUploadSupportAnhang } from "@/lib/services/support";
import type { SupportKategorie, SupportPrioritaet } from "@/lib/services/support";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function TenantSupportWidget() {
  const pathname = usePathname();
  const tickets = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const uploadAnhang = useUploadSupportAnhang();
  const [offen, setOffen] = useState(false);
  const [gesendet, setGesendet] = useState<string | null>(null);
  const [anhangHochgeladen, setAnhangHochgeladen] = useState(false);
  const [wirdGesendet, setWirdGesendet] = useState(false);
  const [kategorie, setKategorie] = useState<SupportKategorie>("FRAGE");
  const [prioritaet, setPrioritaet] = useState<SupportPrioritaet>("NORMAL");
  const [titel, setTitel] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [datei, setDatei] = useState<File | null>(null);

  /** Die Datei wird schon im Formular ausgewählt, aber erst nach dem Anlegen des Tickets
   * hochgeladen — der Anhang-Endpunkt braucht zwingend eine Ticket-Id (siehe
   * useUploadSupportAnhang), die es vor dem Absenden noch nicht gibt. Für die Nutzerin läuft das
   * als ein einziger Schritt ab. */
  async function senden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWirdGesendet(true);
    try {
      const dto = await createTicket.mutateAsync({ kategorie, prioritaet, titel: titel.trim(), nachricht: nachricht.trim(), seite: pathname });
      if (datei) await uploadAnhang.mutateAsync({ ticketId: dto.id, file: datei });
      setGesendet(dto.ticketNumber);
      setAnhangHochgeladen(!!datei);
      setTitel("");
      setNachricht("");
      setDatei(null);
    } finally {
      setWirdGesendet(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {offen ? (
        <section role="dialog" aria-modal="true" aria-labelledby="support-title" className="mb-3 max-h-[calc(100vh-6rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-line bg-surface shadow-2xl">
          <header className="sticky top-0 z-10 flex items-center justify-between bg-basil-deep px-5 py-4 text-white">
            <div>
              <p id="support-title" className="font-display text-lg font-semibold">Support kontaktieren</p>
              <p className="text-xs text-white/70">Direkt an den Super Admin</p>
            </div>
            <button type="button" onClick={() => { setOffen(false); setGesendet(null); }} aria-label="Supportfenster schließen" className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10">
              <X size={19} aria-hidden />
            </button>
          </header>
          {gesendet ? (
            <div className="p-5 text-center">
              <CheckCircle2 size={35} className="mx-auto text-ok" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Anfrage wurde gesendet</p>
              <p className="mt-1 text-sm text-muted">Ticket {gesendet} ist jetzt beim Super Admin sichtbar.{anhangHochgeladen && " Ihr Anhang wurde mitgesendet."}</p>
              <div className="mt-4"><Button onClick={() => { setGesendet(null); setAnhangHochgeladen(false); setOffen(false); }}>Schließen</Button></div>
            </div>
          ) : (
            <>
              <form onSubmit={senden} className="flex flex-col gap-4 p-5">
                <div className="rounded-lg bg-info-soft px-3 py-2 text-xs text-info">Aktuelle Seite wird automatisch mitgesendet: {pathname}</div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Art
                    <select value={kategorie} onChange={(event) => setKategorie(event.target.value as SupportKategorie)} className={fieldClass}>
                      <option value="FRAGE">Frage</option>
                      <option value="BUG">Fehler / Bug</option>
                      <option value="FEATURE">Verbesserungswunsch</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Priorität
                    <select value={prioritaet} onChange={(event) => setPrioritaet(event.target.value as SupportPrioritaet)} className={fieldClass}>
                      <option value="NIEDRIG">Niedrig</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HOCH">Hoch</option>
                      <option value="KRITISCH">Kritisch</option>
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Betreff
                  <input value={titel} onChange={(event) => setTitel(event.target.value)} required placeholder="Wobei benötigen Sie Hilfe?" className={fieldClass} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Beschreibung
                  <textarea value={nachricht} onChange={(event) => setNachricht(event.target.value)} required rows={4} placeholder="Beschreiben Sie die Frage oder den Fehler möglichst genau." className={`${fieldClass} py-2`} />
                </label>
                <label className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-line-strong bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-paper">
                  <Paperclip size={14} aria-hidden /> {datei ? datei.name : "Screenshot / Datei anhängen"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => setDatei(event.target.files?.[0] ?? null)}
                  />
                </label>
                <Button type="submit" disabled={wirdGesendet}><MessageSquareText size={16} aria-hidden /> {wirdGesendet ? "Wird gesendet …" : "Anfrage senden"}</Button>
              </form>
              <div className="border-t border-line px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Meine letzten Anfragen</p>
                <div className="mt-3 flex flex-col gap-2">
                  {tickets.slice(0, 3).map((ticket) => {
                    const letzteAntwort = ticket.antworten.at(-1);
                    return (
                      <div key={ticket.id} className="rounded-lg bg-paper px-3 py-2.5">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{ticket.titel}</p>
                          <span className="text-[11px] text-muted">{ticket.status.replace("_", " ")}</span>
                        </div>
                        {letzteAntwort ? <p className="mt-1 text-xs text-basil">Antwort von {letzteAntwort.autor}: {letzteAntwort.text}</p> : <p className="mt-1 text-xs text-muted">Noch keine Antwort</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      ) : null}
      <button type="button" onClick={() => setOffen((wert) => !wert)} aria-expanded={offen} aria-label={offen ? "Support schließen" : "Hilfe & Support öffnen"} title={offen ? "Schließen" : "Hilfe & Support"} className="ml-auto flex size-11 items-center justify-center rounded-full bg-basil text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil">{offen ? <X size={18} aria-hidden /> : <LifeBuoy size={18} aria-hidden />}</button>
    </div>
  );
}

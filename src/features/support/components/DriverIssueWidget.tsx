"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, LifeBuoy, MessageSquareText, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useReportDriverIssue } from "@/lib/services/driver-issues";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

/** Fahrer-Pendant zu TenantSupportWidget — statt an den Super Admin (Plattform-Support) geht die
 * Nachricht hier an den eigenen Tenant-Admin, als Broadcast-Benachrichtigung (siehe
 * DriverIssueHandler). Bewusst ohne Verlaufsliste/Kategorien/Anhänge: ein Fahrer braucht nur einen
 * schnellen Weg, eine Frage oder ein Problem loszuwerden, keinen vollen Ticket-Workflow. */
export function DriverIssueWidget() {
  const reportIssue = useReportDriverIssue();
  const [offen, setOffen] = useState(false);
  const [gesendet, setGesendet] = useState(false);
  const [nachricht, setNachricht] = useState("");

  async function senden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await reportIssue.mutateAsync(nachricht.trim());
    setGesendet(true);
    setNachricht("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {offen ? (
        <section role="dialog" aria-modal="true" aria-labelledby="fahrer-frage-title" className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-line bg-surface shadow-2xl">
          <header className="flex items-center justify-between bg-basil-deep px-5 py-4 text-white">
            <div>
              <p id="fahrer-frage-title" className="font-display text-lg font-semibold">Frage oder Problem melden</p>
              <p className="text-xs text-white/70">Geht direkt an Ihren Admin</p>
            </div>
            <button type="button" onClick={() => { setOffen(false); setGesendet(false); }} aria-label="Fenster schließen" className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10">
              <X size={19} aria-hidden />
            </button>
          </header>
          {gesendet ? (
            <div className="p-5 text-center">
              <CheckCircle2 size={35} className="mx-auto text-ok" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Nachricht wurde gesendet</p>
              <p className="mt-1 text-sm text-muted">Ihr Admin wurde benachrichtigt.</p>
              <div className="mt-4"><Button onClick={() => { setGesendet(false); setOffen(false); }}>Schließen</Button></div>
            </div>
          ) : (
            <form onSubmit={senden} className="flex flex-col gap-4 p-5">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Ihre Nachricht
                <textarea
                  value={nachricht}
                  onChange={(event) => setNachricht(event.target.value)}
                  required
                  rows={4}
                  placeholder="Frage oder Problem beschreiben …"
                  className={`${fieldClass} py-2`}
                />
              </label>
              <Button type="submit" disabled={reportIssue.isPending}>
                <MessageSquareText size={16} aria-hidden /> {reportIssue.isPending ? "Wird gesendet …" : "Nachricht senden"}
              </Button>
            </form>
          )}
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOffen((wert) => !wert)}
        aria-expanded={offen}
        aria-label={offen ? "Schließen" : "Frage oder Problem melden"}
        title={offen ? "Schließen" : "Frage oder Problem melden"}
        className="ml-auto flex size-11 items-center justify-center rounded-full bg-basil text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil"
      >
        {offen ? <X size={18} aria-hidden /> : <LifeBuoy size={18} aria-hidden />}
      </button>
    </div>
  );
}

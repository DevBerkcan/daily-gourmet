"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, LifeBuoy } from "lucide-react";
import { ACTION_ICONS, Button } from "@/components/ui";
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
        <section role="dialog" aria-modal="true" aria-labelledby="fahrer-frage-title" className="mb-3 max-h-[calc(100vh-6rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-line bg-surface shadow-2xl">
          <header className="flex items-center justify-between gap-3 bg-basil-deep px-5 py-4 text-white">
            <div className="min-w-0">
              <p id="fahrer-frage-title" className="font-display text-lg font-semibold">Frage oder Problem melden</p>
              <p className="text-xs text-white/70">Geht direkt an Ihren Admin</p>
            </div>
            <Button icon={ACTION_ICONS.cancel} label="Fenster schließen" variant="ghost" showLabel className="!text-white hover:!bg-white/10" onClick={() => { setOffen(false); setGesendet(false); }} />
          </header>
          {gesendet ? (
            <div className="p-5 text-center">
              <CheckCircle2 size={35} className="mx-auto text-ok" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Nachricht wurde gesendet</p>
              <p className="mt-1 text-sm text-muted">Ihr Admin wurde benachrichtigt.</p>
              <div className="mt-4"><Button icon={ACTION_ICONS.cancel} label="Schließen" showLabel onClick={() => { setGesendet(false); setOffen(false); }} /></div>
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
              <Button icon={ACTION_ICONS.send} label="Nachricht senden" showLabel type="submit" loading={reportIssue.isPending} className="self-end" />
            </form>
          )}
        </section>
      ) : null}
      <div className="flex justify-end">
        <Button
          icon={offen ? ACTION_ICONS.cancel : LifeBuoy}
          expanded={offen}
          label={offen ? "Schließen" : "Frage oder Problem melden"}
          size="lg"
          className="!rounded-full shadow-lg"
          onClick={() => setOffen((wert) => !wert)}
        />
      </div>
    </div>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, ClipboardPenLine } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { setWorkStatus } from "../store";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function CompletionReport({ planId, rezeptId, sollMenge }: { planId: string; rezeptId: string; sollMenge: number }) {
  const [gespeichert, setGespeichert] = useState(false);
  const [produziert, setProduziert] = useState(String(sollMenge));
  const [ausschuss, setAusschuss] = useState("0");
  const [rest, setRest] = useState("0");
  const [hinweis, setHinweis] = useState("");

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkStatus(planId, rezeptId, "FERTIG");
    setGespeichert(true);
  }

  return (
    <Card>
      <CardHeader title="Produktionsabschluss" hint="Ist-Menge, Ausschuss und Reste für die Nachkalkulation melden." actions={<ClipboardPenLine size={18} className="text-basil" aria-hidden />} />
      {gespeichert ? (
        <div className="flex items-start gap-3 bg-ok-soft px-5 py-4 text-sm"><CheckCircle2 size={19} className="mt-0.5 shrink-0 text-ok" aria-hidden /><div><p className="font-semibold text-ink">Produktionsrückmeldung gespeichert</p><p className="mt-1 text-muted">{produziert} Portionen produziert · {ausschuss} Ausschuss · {rest} Restmenge</p><Button variant="ghost" onClick={() => setGespeichert(false)}>Angaben bearbeiten</Button></div></div>
      ) : (
        <form onSubmit={speichern} className="grid gap-4 p-5 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Tatsächlich produziert<input type="number" min="0" value={produziert} onChange={(event) => setProduziert(event.target.value)} required className={fieldClass} /></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Ausschuss<input type="number" min="0" value={ausschuss} onChange={(event) => setAusschuss(event.target.value)} className={fieldClass} /></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Restmenge<input type="number" min="0" value={rest} onChange={(event) => setRest(event.target.value)} className={fieldClass} /></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted sm:col-span-3">Hinweis / Begründung<textarea value={hinweis} onChange={(event) => setHinweis(event.target.value)} rows={2} placeholder="Nur bei Abweichungen erforderlich" className={`${fieldClass} py-2`} /></label>
          <div className="sm:col-span-3"><Button type="submit"><CheckCircle2 size={16} aria-hidden /> Produktion abschließen</Button></div>
        </form>
      )}
    </Card>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, ClipboardCheck, Plus, Thermometer } from "lucide-react";
import { Button, Card, CardHeader, Table, Td } from "@/components/ui";
import { kontrollenSeed } from "../data";

type Kontrolle = (typeof kontrollenSeed)[number];

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function ControlsBoard() {
  const [kontrollen, setKontrollen] = useState<Kontrolle[]>(kontrollenSeed);
  const [offen, setOffen] = useState(false);
  const [art, setArt] = useState("Kerntemperatur");
  const [bereich, setBereich] = useState("Vollkorn Penne mit Tomaten-Kräutersauce · Charge 2");
  const [soll, setSoll] = useState("mind. 75 °C");
  const [ist, setIst] = useState("");

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ist.trim()) return;
    const neu: Kontrolle = { id: `ctrl-${Date.now()}`, zeit: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), art, bereich, soll, ist: ist.trim(), person: "Petra Salomon", status: "OK" };
    setKontrollen((aktuell) => [neu, ...aktuell]);
    setIst("");
    setOffen(false);
  }

  return (
    <>
      <div className="mb-6 rounded-card border border-ok/30 bg-ok-soft px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3"><CheckCircle2 size={21} className="mt-0.5 shrink-0 text-ok" aria-hidden /><div><p className="font-semibold text-ink">Alle Pflichtkontrollen im Zeitplan</p><p className="mt-1 text-sm text-muted">Nächste Kontrolle: Kerntemperatur Penne · Charge 2 um 09:20 Uhr.</p></div></div>
          <Button onClick={() => setOffen((wert) => !wert)}><Plus size={16} aria-hidden /> Kontrolle erfassen</Button>
        </div>
      </div>

      {offen ? (
        <Card className="mb-6">
          <CardHeader title="Neue HACCP-Kontrolle" hint="Messwert unmittelbar nach der Messung eintragen." actions={<Thermometer size={19} className="text-warn" aria-hidden />} />
          <form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Kontrollart<select value={art} onChange={(event) => setArt(event.target.value)} className={fieldClass}><option>Kerntemperatur</option><option>Warmhaltetemperatur</option><option>Kühltemperatur</option><option>Wareneingang</option></select></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Gericht / Bereich<input value={bereich} onChange={(event) => setBereich(event.target.value)} className={fieldClass} /></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Sollwert<input value={soll} onChange={(event) => setSoll(event.target.value)} className={fieldClass} /></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Messwert<input value={ist} onChange={(event) => setIst(event.target.value)} placeholder="z. B. 78,2 °C" required className={fieldClass} /></label>
            <div className="flex gap-2 md:col-span-2 xl:col-span-4"><Button type="submit">Kontrolle speichern</Button><Button variant="secondary" onClick={() => setOffen(false)}>Abbrechen</Button></div>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Kontrollprotokoll heute" hint={`${kontrollen.length} Messungen dokumentiert`} actions={<ClipboardCheck size={19} className="text-basil" aria-hidden />} />
        <Table head={["Zeit", "Kontrolle", "Gericht / Bereich", "Sollwert", "Messwert", "Erfasst von", "Status"]}>
          {kontrollen.map((kontrolle) => <tr key={kontrolle.id}><Td className="font-semibold text-ink">{kontrolle.zeit}</Td><Td>{kontrolle.art}</Td><Td>{kontrolle.bereich}</Td><Td className="text-muted">{kontrolle.soll}</Td><Td className="font-display text-lg font-semibold text-ink">{kontrolle.ist}</Td><Td>{kontrolle.person}</Td><Td><span className="inline-flex items-center gap-1.5 text-xs font-medium text-ok"><CheckCircle2 size={15} aria-hidden />In Ordnung</span></Td></tr>)}
        </Table>
      </Card>
    </>
  );
}

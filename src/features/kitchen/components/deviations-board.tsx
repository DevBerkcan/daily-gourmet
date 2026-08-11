"use client";

import { type FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { Button, Card, CardHeader, StatCard, Table, Td } from "@/components/ui";
import { abweichungenSeed } from "../data";

type Abweichung = (typeof abweichungenSeed)[number];
const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function DeviationsBoard() {
  const [abweichungen, setAbweichungen] = useState<Abweichung[]>(abweichungenSeed);
  const [offen, setOffen] = useState(false);
  const [kategorie, setKategorie] = useState("Fehlbestand");
  const [betreff, setBetreff] = useState("");
  const [menge, setMenge] = useState("");
  const [massnahme, setMassnahme] = useState("");
  const offeneAnzahl = abweichungen.filter((abweichung) => abweichung.status === "OFFEN").length;

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!betreff.trim() || !massnahme.trim()) return;
    const neu: Abweichung = { id: `dev-${Date.now()}`, zeit: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), kategorie, betreff: betreff.trim(), menge: menge.trim() || "—", massnahme: massnahme.trim(), person: "Petra Salomon", status: "OFFEN" };
    setAbweichungen((aktuell) => [neu, ...aktuell]);
    setBetreff(""); setMenge(""); setMassnahme(""); setOffen(false);
  }

  function klaeren(id: string) {
    setAbweichungen((aktuell) => aktuell.map((abweichung) => abweichung.id === id ? { ...abweichung, status: "GEKLÄRT" } : abweichung));
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Abweichungen heute" value={String(abweichungen.length)} />
        <StatCard label="Noch offen" value={String(offeneAnzahl)} tone={offeneAnzahl ? "warn" : "ok"} />
        <StatCard label="Geklärt" value={String(abweichungen.length - offeneAnzahl)} tone="ok" />
      </div>
      <div className="my-6 flex justify-end"><Button onClick={() => setOffen((wert) => !wert)}><Plus size={16} aria-hidden /> Abweichung melden</Button></div>

      {offen ? <Card className="mb-6"><CardHeader title="Neue Abweichung" hint="Fehlmengen, Ausschuss, Verspätungen oder technische Probleme dokumentieren." actions={<AlertTriangle size={19} className="text-warn" aria-hidden />} /><form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Kategorie<select value={kategorie} onChange={(event) => setKategorie(event.target.value)} className={fieldClass}><option>Fehlbestand</option><option>Produktionsmenge</option><option>Qualität</option><option>Temperatur</option><option>Gerät</option><option>Verspätung</option></select></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Gericht / Zutat / Gerät<input value={betreff} onChange={(event) => setBetreff(event.target.value)} required className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Menge / Auswirkung<input value={menge} onChange={(event) => setMenge(event.target.value)} placeholder="z. B. 8 Portionen Ausschuss" className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Sofortmaßnahme<input value={massnahme} onChange={(event) => setMassnahme(event.target.value)} required className={fieldClass} /></label>
        <div className="flex gap-2 md:col-span-2"><Button type="submit">Meldung speichern</Button><Button variant="secondary" onClick={() => setOffen(false)}>Abbrechen</Button></div>
      </form></Card> : null}

      <Card><CardHeader title="Meldungen des Produktionstags" hint="Alle Maßnahmen bleiben nachvollziehbar dokumentiert." /><Table head={["Zeit", "Kategorie", "Betreff", "Auswirkung", "Maßnahme", "Person", "Status / Aktion"]}>
        {abweichungen.map((abweichung) => <tr key={abweichung.id}><Td className="font-semibold text-ink">{abweichung.zeit}</Td><Td>{abweichung.kategorie}</Td><Td className="font-medium text-ink">{abweichung.betreff}</Td><Td>{abweichung.menge}</Td><Td className="max-w-64">{abweichung.massnahme}</Td><Td>{abweichung.person}</Td><Td>{abweichung.status === "GEKLÄRT" ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ok"><CheckCircle2 size={15} aria-hidden />Geklärt</span> : <Button variant="secondary" onClick={() => klaeren(abweichung.id)}>Als geklärt markieren</Button>}</Td></tr>)}
      </Table></Card>
    </>
  );
}

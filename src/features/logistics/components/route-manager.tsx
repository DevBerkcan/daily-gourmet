"use client";

import { type FormEvent, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Clock3, MapPin, Plus, Route, Truck, UserRound } from "lucide-react";
import { Button, Card, CardHeader, StatCard, Pagination } from "@/components/ui";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useStandorte } from "@/lib/services/locations";
import { useFahrer, useLieferRouten, useCreateLieferRoute, portionenJeRoute, behaelterPositionenJeRoute } from "@/lib/services/logistics";
import { usePagination } from "@/lib/use-pagination";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function RouteManager() {
  const routen = useLieferRouten();
  const einrichtungen = useEinrichtungen();
  const standorte = useStandorte();
  const fahrer = useFahrer();
  const createRoute = useCreateLieferRoute();
  const [formularOffen, setFormularOffen] = useState(false);
  const [details, setDetails] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [datum, setDatum] = useState("2026-08-07");
  const [fahrerId, setFahrerId] = useState("");
  const [start, setStart] = useState("10:15");
  const [einrichtungIds, setEinrichtungIds] = useState<string[]>([]);
  const portionen = routen.reduce((summe, route) => summe + portionenJeRoute(route), 0);
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(routen);

  function toggleEinrichtung(id: string) {
    setEinrichtungIds((aktuell) => aktuell.includes(id) ? aktuell.filter((eintrag) => eintrag !== id) : [...aktuell, id]);
  }

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || einrichtungIds.length === 0) return;
    createRoute.mutate(
      { name: name.trim(), datum, fahrerId: fahrerId || undefined, standortId: standorte[0]?.id, start, einrichtungIds },
      { onSuccess: () => { setName(""); setEinrichtungIds([]); setFormularOffen(false); } }
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Routen geplant" value={String(routen.length)} hint="Für den gewählten Produktionstag" />
        <StatCard label="Kundenstopps" value={String(routen.reduce((summe, route) => summe + route.stopps.length, 0))} />
        <StatCard label="Auszuliefernde Portionen" value={String(portionen)} tone="ok" />
      </div>

      <div className="my-6 flex justify-end"><Button onClick={() => setFormularOffen((wert) => !wert)}><Plus size={16} aria-hidden /> Neue Route definieren</Button></div>

      {formularOffen ? (
        <Card className="mb-6">
          <CardHeader title="Neue Liefertour" hint="Fahrer, Startzeit und Kunden in der gewünschten Reihenfolge zuordnen." actions={<Route size={19} className="text-basil" aria-hidden />} />
          <form onSubmit={speichern} className="grid gap-5 p-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Routenname<input value={name} onChange={(event) => setName(event.target.value)} placeholder="z. B. Route Innenstadt" required className={fieldClass} /></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Fahrer<select value={fahrerId} onChange={(event) => setFahrerId(event.target.value)} className={fieldClass}><option value="">Noch nicht vergeben (Fahrer übernimmt selbst)</option>{fahrer.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.kennzeichen}</option>)}</select></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Datum<input type="date" value={datum} onChange={(event) => setDatum(event.target.value)} required className={fieldClass} /></label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Abfahrt<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required className={fieldClass} /></label>
            <fieldset className="md:col-span-2"><legend className="mb-2 text-xs font-medium text-muted">Kunden auswählen · Reihenfolge entspricht der Auswahl</legend><p className="mb-3 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">Die bestellten Speisen und Portionen des gewählten Tages werden automatisch als Ladepositionen übernommen.</p><div className="grid gap-2 sm:grid-cols-2">{einrichtungen.filter((einrichtung) => einrichtung.status === "AKTIV").map((einrichtung) => <label key={einrichtung.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${einrichtungIds.includes(einrichtung.id) ? "border-basil bg-basil-soft" : "border-line bg-surface"}`}><input type="checkbox" checked={einrichtungIds.includes(einrichtung.id)} onChange={() => toggleEinrichtung(einrichtung.id)} className="mt-0.5 size-4 accent-basil" /><span><strong className="block text-ink">{einrichtung.name}</strong><span className="text-xs text-muted">{einrichtung.anschrift}</span></span></label>)}</div></fieldset>
            <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={!name.trim() || einrichtungIds.length === 0}>Route speichern</Button><Button variant="secondary" onClick={() => setFormularOffen(false)}>Abbrechen</Button></div>
          </form>
        </Card>
      ) : null}

      <div className="flex flex-col gap-5">
        {pageItems.map((route) => {
          const istOffen = details === route.id;
          const person = fahrer.find((f) => f.id === route.fahrerId);
          return <Card key={route.id}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-medium text-info">{route.status === "BELADUNG" ? "In Beladung" : "Geplant"}</span><span className="text-xs text-muted">{new Date(`${route.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}</span></div><h2 className="mt-2 font-display text-xl font-semibold text-ink">{route.name}</h2><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="inline-flex items-center gap-1.5"><UserRound size={15} aria-hidden />{route.fahrerName ?? "Nicht vergeben"}</span><span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden />{person?.fahrzeug} · {person?.kennzeichen}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden />{route.start}{route.rueckkehr ? `–${route.rueckkehr}` : ""} Uhr</span></div></div>
              <div className="flex items-center gap-5"><div className="text-right"><p className="font-display text-2xl font-semibold text-basil">{portionenJeRoute(route)}</p><p className="text-xs text-muted">Portionen · {route.stopps.length} Stopps</p></div><Button variant="secondary" onClick={() => setDetails(istOffen ? null : route.id)}>{istOffen ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}{istOffen ? "Schließen" : "Tour anzeigen"}</Button></div>
            </div>
            {istOffen ? <div className="border-t border-line bg-paper/50 px-5 py-5"><div className="relative ml-3 border-l-2 border-basil-soft pl-6">{route.stopps.map((stopp) => {
              const einrichtung = einrichtungen.find((e) => e.id === stopp.einrichtungId);
              return <div key={stopp.id} className="relative pb-6 last:pb-0"><span className="absolute -left-[33px] flex size-4 items-center justify-center rounded-full bg-basil text-[9px] font-bold text-white">{stopp.reihenfolge}</span><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-ink">{stopp.einrichtungName}</p><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted"><MapPin size={13} aria-hidden />{einrichtung?.anschrift}</p><p className="mt-1 text-xs text-muted">Ankunft {stopp.ankunft}{stopp.zeitfenster ? ` · Zeitfenster ${stopp.zeitfenster}` : ""}</p></div><div className="text-right">{stopp.positionen.map((position) => <p key={position.id} className="text-sm"><strong className="text-basil">{position.portionen}</strong> {position.rezeptName} · {position.behaelter}</p>)}</div></div></div>;
            })}</div><p className="mt-5 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-muted"><CalendarDays size={14} aria-hidden />{behaelterPositionenJeRoute(route)} Ladepositionen werden automatisch an den Fahrer übergeben.</p></div> : null}
          </Card>;
        })}
      </div>
      <Card className="mt-5">
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
    </>
  );
}

"use client";

import { AlertTriangle, Check, MapPin, Navigation, PackageCheck, Phone, Play, Route } from "lucide-react";
import { Button, Card, CardHeader, StatCard } from "@/components/ui";
import { einrichtungById } from "@/lib/data";
import { rezeptById } from "@/features/recipes/data";
import { fahrerById, portionenJeRoute } from "../data";
import { toggleGeladen, updateRouteStatus, useGeladenePositionen, useLieferRouten } from "../store";

const currentDriverId = "drv-001";

export function DriverDashboard() {
  const routen = useLieferRouten();
  const geladen = useGeladenePositionen();
  const route = routen.find((eintrag) => eintrag.fahrerId === currentDriverId);
  if (!route) return <Card><div className="p-8 text-center text-sm text-muted">Für heute ist keine Route zugeordnet.</div></Card>;
  const person = fahrerById(route.fahrerId);
  const ladePositionen = route.stopps.flatMap((stopp) => stopp.positionen.map((position) => ({ ...position, stopp })));
  const allesGeladen = ladePositionen.length > 0 && ladePositionen.every((position) => geladen.has(position.id));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Stopps" value={String(route.stopps.length)} hint={`${route.kilometer} km geplant`} />
        <StatCard label="Portionen an Bord" value={String(portionenJeRoute(route))} />
        <StatCard label="Abfahrt" value={`${route.start} Uhr`} tone={allesGeladen ? "ok" : "warn"} hint={allesGeladen ? "Ladung vollständig" : `${geladen.size} von ${ladePositionen.length} Positionen geladen`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Ladeliste" hint="Jede Position beim Einladen kontrollieren und abhaken." actions={<PackageCheck size={19} className="text-basil" aria-hidden />} />
            <div className="divide-y divide-line">
              {ladePositionen.map((position) => {
                const einrichtung = einrichtungById(position.stopp.einrichtungId);
                const istGeladen = geladen.has(position.id);
                return <button key={position.id} type="button" onClick={() => toggleGeladen(position.id)} aria-pressed={istGeladen} className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors ${istGeladen ? "bg-ok-soft" : "hover:bg-paper"}`}><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border ${istGeladen ? "border-ok bg-ok text-white" : "border-line-strong bg-surface"}`}>{istGeladen ? <Check size={15} aria-hidden /> : null}</span><span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{position.portionen} Portionen · {rezeptById(position.rezeptId)?.name}</span><span className="mt-1 block text-sm text-muted">{position.behaelter} · {einrichtung?.name}</span><span className="mt-1 block text-xs font-medium text-warn">{position.temperatur}{position.hinweis ? ` · ${position.hinweis}` : ""}</span></span></button>;
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Stoppreihenfolge" hint="Geplante Ankunft und Lieferzeitfenster" actions={<Route size={19} className="text-basil" aria-hidden />} />
            <div className="relative ml-8 border-l-2 border-basil-soft py-5 pr-5">
              {route.stopps.map((stopp) => { const einrichtung = einrichtungById(stopp.einrichtungId); return <div key={stopp.id} className="relative pb-7 pl-7 last:pb-0"><span className="absolute -left-[13px] flex size-6 items-center justify-center rounded-full bg-basil text-xs font-bold text-white">{stopp.reihenfolge}</span><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold text-ink">{einrichtung?.name}</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden />{einrichtung?.anschrift}</p><p className="mt-1 text-xs text-muted">Kontakt: {stopp.kontakt} · {stopp.telefon}</p></div><div className="text-right"><p className="font-semibold text-basil">{stopp.ankunft} Uhr</p><p className="text-xs text-muted">Fenster {stopp.zeitfenster}</p></div></div>{stopp.hinweis ? <p className="mt-2 rounded-lg bg-saffron-soft px-3 py-2 text-xs font-medium text-warn">{stopp.hinweis}</p> : null}</div>; })}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card><CardHeader title="Fahrzeug & Tour" /><dl className="divide-y divide-line text-sm"><div className="flex justify-between gap-3 px-5 py-3"><dt className="text-muted">Route</dt><dd className="font-semibold text-ink">{route.name}</dd></div><div className="flex justify-between gap-3 px-5 py-3"><dt className="text-muted">Fahrzeug</dt><dd className="text-right font-semibold text-ink">{person?.fahrzeug}<br /><span className="text-xs text-muted">{person?.kennzeichen}</span></dd></div><div className="flex justify-between gap-3 px-5 py-3"><dt className="text-muted">Rückkehr</dt><dd className="font-semibold text-ink">ca. {route.rueckkehr} Uhr</dd></div></dl></Card>
          {!allesGeladen ? <div className="flex gap-3 rounded-card border border-warn/30 bg-warn-soft px-4 py-3 text-sm"><AlertTriangle size={19} className="shrink-0 text-warn" aria-hidden /><p><strong className="block text-ink">Ladung noch unvollständig</strong><span className="text-muted">Tourstart wird freigegeben, sobald alle Positionen kontrolliert wurden.</span></p></div> : null}
          <Button disabled={!allesGeladen} onClick={() => updateRouteStatus(route.id, "UNTERWEGS")}><Play size={16} aria-hidden /> Tour starten</Button>
          <Button href={`/driver/routes/${route.id}`} variant="secondary"><Navigation size={16} aria-hidden /> Routenansicht öffnen</Button>
          <a href={`tel:${person?.telefon.replace(/\s/g, "")}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink hover:bg-paper"><Phone size={16} aria-hidden /> Disposition anrufen</a>
        </div>
      </div>
    </>
  );
}

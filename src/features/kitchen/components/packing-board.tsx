"use client";

import { Check, Clock3, PackageCheck, Thermometer, Truck, UserRound } from "lucide-react";
import { Button, Card, CardHeader, StatCard, Table, Td } from "@/components/ui";
import { useFahrer, useLieferRouten, useToggleVerpackt, portionenJeRoute } from "@/lib/services/logistics";

export function PackingBoard() {
  const fahrer = useFahrer();
  const routen = useLieferRouten();
  const toggleVerpackt = useToggleVerpackt();
  const positionen = routen.flatMap((route) => route.stopps.flatMap((stopp) => stopp.positionen));
  const portionen = routen.reduce((summe, route) => summe + portionenJeRoute(route), 0);
  const offene = positionen.filter((position) => !position.verpackt).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Zu verpacken" value={`${portionen} Portionen`} />
        <StatCard label="Lieferrouten" value={String(routen.length)} hint={`${routen.reduce((summe, route) => summe + route.stopps.length, 0)} Kundenstopps`} />
        <StatCard label="Noch offen" value={String(offene)} tone={offene ? "warn" : "ok"} />
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {routen.map((route) => {
          const person = fahrer.find((f) => f.id === route.fahrerId);
          const routePositionen = route.stopps.flatMap((stopp) => stopp.positionen);
          const fertig = routePositionen.filter((position) => position.verpackt).length;
          return <Card key={route.id}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4"><div><div className="flex items-center gap-2"><Truck size={18} className="text-basil" aria-hidden /><h2 className="font-display text-xl font-semibold text-ink">{route.name}</h2><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${fertig === routePositionen.length ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{fertig === routePositionen.length ? "Bereit zur Beladung" : `${fertig} / ${routePositionen.length} verpackt`}</span></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="inline-flex items-center gap-1.5"><UserRound size={14} aria-hidden />{person?.name}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} aria-hidden />Abfahrt {route.start} Uhr</span><span>{person?.kennzeichen}</span></div></div><div className="text-right"><p className="font-display text-2xl font-semibold text-basil">{portionenJeRoute(route)}</p><p className="text-xs text-muted">Portionen · {route.stopps.length} Stopps</p></div></div>
            <CardHeader title="Packpositionen nach Stoppreihenfolge" hint="Die Positionen werden dem Fahrer in derselben Reihenfolge angezeigt." actions={<PackageCheck size={19} className="text-basil" aria-hidden />} />
            <Table head={["Stopp & Kunde", "Gericht", "Menge", "Behälter", "Temperatur", "Küchenstatus", "Fahrer"]}>
              {route.stopps.flatMap((stopp) => stopp.positionen.map((position) => (
                <tr key={position.id} className={position.verpackt ? "bg-ok-soft/40" : undefined}><Td><p className="font-semibold text-ink">{stopp.reihenfolge}. {stopp.einrichtungName}</p><p className="mt-0.5 text-xs text-muted">Ankunft {stopp.ankunft}</p></Td><Td className="font-medium text-ink">{position.rezeptName}</Td><Td className="font-display text-lg font-semibold text-basil">{position.portionen}</Td><Td>{position.behaelter}</Td><Td><span className="inline-flex items-center gap-1.5"><Thermometer size={14} className="text-warn" aria-hidden />{position.temperatur}</span></Td><Td><Button variant={position.verpackt ? "secondary" : "primary"} onClick={() => toggleVerpackt.mutate({ routeId: route.id, stoppId: stopp.id, positionId: position.id })}>{position.verpackt ? "Rückgängig" : <><Check size={15} aria-hidden /> Bereit</>}</Button></Td><Td>{position.geladen ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ok"><Check size={14} aria-hidden />Geladen</span> : <span className="text-xs text-muted">Noch nicht geladen</span>}</Td></tr>
              )))}
            </Table>
          </Card>;
        })}
      </div>
    </>
  );
}

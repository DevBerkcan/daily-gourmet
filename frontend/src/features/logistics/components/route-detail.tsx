"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, MapPin, Navigation, PackageCheck, Phone, Route as RouteIcon, Thermometer, Truck } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { einrichtungById } from "@/lib/data";
import { rezeptById } from "@/features/recipes/data";
import { fahrerById, portionenJeRoute } from "../data";
import { setStoppStatus, updateRouteStatus, useLieferRouten, useStoppStatus } from "../store";

const SUBTITLE = "Stopps der Reihe nach anfahren und jede Zustellung bestätigen.";

function Breadcrumb() {
  return (
    <nav aria-label="Brotkrumen" className="mb-4">
      <Link href="/driver/routes" className="inline-flex items-center gap-1.5 text-sm font-medium text-basil hover:underline">
        <ArrowLeft size={15} aria-hidden /> Zurück zu meinen Touren
      </Link>
    </nav>
  );
}

export function DriverRouteDetail({ id }: { id: string }) {
  const routen = useLieferRouten();
  const statuses = useStoppStatus();
  const route = routen.find((eintrag) => eintrag.id === id);

  if (!route) {
    return (
      <>
        <Breadcrumb />
        <PageHeader title="Routenansicht" subtitle={SUBTITLE} />
        <Card><EmptyState title="Route nicht gefunden" text="Diese Route ist nicht mehr verfügbar." action={<Button href="/driver/routes">Zu meinen Touren</Button>} /></Card>
      </>
    );
  }

  const person = fahrerById(route.fahrerId);
  const zugestellt = route.stopps.filter((stopp) => statuses.get(stopp.id) === "ZUGESTELLT").length;
  const alleZugestellt = zugestellt === route.stopps.length;

  function routeAbschliessen() {
    updateRouteStatus(id, "ABGESCHLOSSEN");
  }

  return (
    <>
      <Breadcrumb />
      <PageHeader title={route.name} subtitle={SUBTITLE} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Fortschritt" value={`${zugestellt} / ${route.stopps.length} Stopps`} tone={alleZugestellt ? "ok" : "default"} />
        <StatCard label="Ladung" value={`${portionenJeRoute(route)} Portionen`} />
        <StatCard label="Geplante Rückkehr" value={`${route.rueckkehr} Uhr`} hint={`${route.kilometer} km Gesamtroute`} />
      </div>

      <Card className="my-6"><div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div><p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink"><Truck size={17} className="text-basil" aria-hidden />{person?.fahrzeug} · {person?.kennzeichen}</p><p className="mt-1 text-xs text-muted">Abfahrt {route.start} Uhr · Fahrer {person?.name}</p></div><div className="flex gap-2"><a href={`tel:${person?.telefon.replace(/\s/g, "")}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm font-medium hover:bg-paper"><Phone size={16} aria-hidden /> Disposition</a>{alleZugestellt ? <Button onClick={routeAbschliessen}><CheckCircle2 size={16} aria-hidden /> Tour abschließen</Button> : null}</div></div></Card>

      <div className="flex flex-col gap-5">
        {route.stopps.map((stopp) => {
          const einrichtung = einrichtungById(stopp.einrichtungId);
          const status = statuses.get(stopp.id) ?? "OFFEN";
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(einrichtung?.anschrift ?? "")}`;
          return <Card key={stopp.id} className={status === "ZUGESTELLT" ? "border-ok/40" : status === "PROBLEM" ? "border-danger/40" : ""}>
            <div className={`flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4 ${status === "ZUGESTELLT" ? "bg-ok-soft" : status === "PROBLEM" ? "bg-danger-soft" : ""}`}><div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-basil font-display font-semibold text-white">{stopp.reihenfolge}</span><div><h2 className="font-display text-xl font-semibold text-ink">{einrichtung?.name}</h2><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden />{einrichtung?.anschrift}</p></div></div><div className="text-right"><p className="font-display text-xl font-semibold text-basil">{stopp.ankunft} Uhr</p><p className="text-xs text-muted">Lieferfenster {stopp.zeitfenster}</p></div></div>
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px]">
              <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Bei diesem Kunden ausladen</p><div className="divide-y divide-line rounded-lg border border-line">{stopp.positionen.map((position) => <div key={position.id} className="flex items-start justify-between gap-3 px-4 py-3"><div><p className="font-semibold text-ink">{rezeptById(position.rezeptId)?.name}</p><p className="mt-1 text-xs text-muted">{position.behaelter}{position.hinweis ? ` · ${position.hinweis}` : ""}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-warn"><Thermometer size={13} aria-hidden />{position.temperatur}</p></div><p className="font-display text-xl font-semibold text-basil">{position.portionen}</p></div>)}</div>{stopp.hinweis ? <p className="mt-3 rounded-lg bg-saffron-soft px-3 py-2 text-sm font-medium text-warn">{stopp.hinweis}</p> : null}</div>
              <div className="flex flex-col gap-3"><a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-basil px-4 text-sm font-medium text-white hover:bg-basil-deep"><Navigation size={17} aria-hidden /> Navigation starten</a><a href={`tel:${stopp.telefon.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong px-4 text-sm font-medium hover:bg-paper"><Phone size={17} aria-hidden /> {stopp.kontakt} anrufen</a>{status !== "ZUGESTELLT" ? <Button onClick={() => setStoppStatus(stopp.id, "ZUGESTELLT")}><PackageCheck size={16} aria-hidden /> Erfolgreich zugestellt</Button> : <div className="flex items-center justify-center gap-2 rounded-lg bg-ok-soft px-4 py-3 text-sm font-semibold text-ok"><CheckCircle2 size={17} aria-hidden /> Zugestellt</div>}{status !== "PROBLEM" && status !== "ZUGESTELLT" ? <Button variant="danger" onClick={() => setStoppStatus(stopp.id, "PROBLEM")}><AlertTriangle size={16} aria-hidden /> Problem melden</Button> : null}{status === "PROBLEM" ? <Button variant="secondary" onClick={() => setStoppStatus(stopp.id, "OFFEN")}><RouteIcon size={16} aria-hidden /> Problem geklärt</Button> : null}</div>
            </div>
          </Card>;
        })}
      </div>
    </>
  );
}

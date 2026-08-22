"use client";

import { ArrowRight, CalendarDays, Clock3, MapPin, Route } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useAktuelleFahrerRouten, portionenJeRoute } from "@/lib/services/logistics";

export function RoutesList() {
  const routen = useAktuelleFahrerRouten();
  return <div className="flex flex-col gap-5">{routen.map((route) => <Card key={route.id}><div className="flex flex-wrap items-center justify-between gap-5 px-5 py-5"><div><div className="flex items-center gap-2"><Route size={17} className="text-basil" aria-hidden /><h2 className="font-display text-xl font-semibold text-ink">{route.name}</h2><span className="rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-medium text-info">{route.status === "BELADUNG" ? "Beladung" : route.status === "UNTERWEGS" ? "Unterwegs" : route.status === "ABGESCHLOSSEN" ? "Abgeschlossen" : "Geplant"}</span></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden />{new Date(`${route.datum}T12:00:00`).toLocaleDateString("de-DE")}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} aria-hidden />{route.start}{route.rueckkehr ? `–${route.rueckkehr}` : ""} Uhr</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} aria-hidden />{route.stopps.length} Stopps{route.kilometer != null ? ` · ${route.kilometer} km` : ""}</span></div></div><div className="flex items-center gap-5"><div className="text-right"><p className="font-display text-2xl font-semibold text-basil">{portionenJeRoute(route)}</p><p className="text-xs text-muted">Portionen</p></div><Button href={`/driver/routes/${route.id}`}>Tour öffnen <ArrowRight size={16} aria-hidden /></Button></div></div></Card>)}</div>;
}

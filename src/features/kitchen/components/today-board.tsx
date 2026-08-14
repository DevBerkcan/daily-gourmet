"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ChefHat, Clock3, Play, RotateCcw, Users } from "lucide-react";
import { Button, Card, CardHeader, StatCard } from "@/components/ui";
import { produktionsplaene } from "@/features/production/data";
import { rezeptById } from "@/features/recipes/data";
import { aenderungen, geraeteBelegung, produktionsMetaFuer, workStatusOrder } from "../data";
import { setWorkStatus, useWorkStatuses } from "../store";
import { KitchenStatus } from "./kitchen-status";

const plan = produktionsplaene[0];

export function TodayBoard() {
  const statuses = useWorkStatuses();
  const gesamt = plan.positionen.reduce((summe, position) => summe + position.bestellteMenge + position.zusatzMenge, 0);
  const fertig = plan.positionen.filter((position) => {
    const status = statuses.get(`${plan.id}:${position.rezeptId}`) ?? "OFFEN";
    return status === "FERTIG" || status === "VERPACKT" || status === "ABHOLBEREIT";
  }).length;
  const laufend = plan.positionen.filter((position) => statuses.get(`${plan.id}:${position.rezeptId}`) === "ZUBEREITUNG").length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Portionen heute" value={String(gesamt)} hint="Bestellt + Sicherheitsmenge" />
        <StatCard label="Gerichte" value={String(plan.positionen.length)} hint={`${fertig} bereits fertig`} />
        <StatCard label="In Zubereitung" value={String(laufend)} tone={laufend ? "warn" : "default"} />
        <StatCard label="Fertig bis" value="10:30" tone="ok" hint="Erste Ausgabe um 10:30 Uhr" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-display text-xl font-semibold text-ink">Was ist jetzt zu tun?</h2><p className="text-sm text-muted">Aufgaben in Produktionsreihenfolge</p></div>
            <span className="text-xs font-medium text-muted">{fertig} von {plan.positionen.length} fertig</span>
          </div>

          {plan.positionen.map((position) => {
            const rezept = rezeptById(position.rezeptId);
            const meta = produktionsMetaFuer(position.rezeptId, rezept?.standardPortionen ?? 10);
            const key = `${plan.id}:${position.rezeptId}`;
            const status = statuses.get(key) ?? "OFFEN";
            const statusIndex = workStatusOrder.indexOf(status);
            const nextStatus = workStatusOrder[Math.min(statusIndex + 1, 3)];
            const portions = position.bestellteMenge + position.zusatzMenge;

            return (
              <Card key={position.rezeptId}>
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><KitchenStatus status={status} /><span className="text-xs font-medium text-muted">{meta?.start} – {meta?.fertigBis} Uhr</span></div>
                    <Link href={`/kitchen/plans/${plan.id}/recipes/${position.rezeptId}`} className="mt-2 block font-display text-xl font-semibold text-ink hover:text-basil hover:underline">
                      {rezept?.name}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5"><Users size={15} aria-hidden /><strong className="text-ink">{portions}</strong> Portionen</span>
                      <span className="inline-flex items-center gap-1.5"><ChefHat size={15} aria-hidden />{meta?.arbeitsplatz}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden />{meta?.chargen} Chargen à ca. {meta?.portionenJeCharge}</span>
                    </div>
                    {meta?.varianten.length ? <p className="mt-3 rounded-lg bg-saffron-soft px-3 py-2 text-xs font-medium text-warn">Besonderheiten: {meta.varianten.join(" · ")}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {statusIndex < 3 ? (
                      <Button onClick={() => setWorkStatus(plan.id, position.rezeptId, nextStatus)}>
                        <Play size={15} aria-hidden /> {nextStatus === "BEREITSTELLUNG" ? "Bereitstellung starten" : nextStatus === "ZUBEREITUNG" ? "Zubereitung starten" : "Fertig melden"}
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => setWorkStatus(plan.id, position.rezeptId, "ZUBEREITUNG")}><RotateCcw size={15} aria-hidden /> Wieder öffnen</Button>
                    )}
                    <Button href={`/kitchen/plans/${plan.id}/recipes/${position.rezeptId}`} variant="ghost">Details öffnen <ArrowRight size={15} aria-hidden /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Wichtige Änderungen" actions={<AlertTriangle size={18} className="text-warn" aria-hidden />} />
            <div className="divide-y divide-line">
              {aenderungen.map((aenderung) => (
                <div key={aenderung.id} className="px-5 py-4">
                  <p className="text-xs font-semibold text-warn">{aenderung.zeit} Uhr</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{aenderung.titel}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{aenderung.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Gerätebelegung" hint="Heute Vormittag" />
            <div className="divide-y divide-line">
              {geraeteBelegung.map((slot) => (
                <div key={`${slot.zeit}-${slot.geraet}`} className="px-5 py-3.5 text-sm">
                  <div className="flex justify-between gap-3"><span className="font-semibold text-ink">{slot.zeit}</span><span className="text-xs text-muted">{slot.charge}</span></div>
                  <p className="mt-1 text-basil">{slot.geraet}</p><p className="text-xs text-muted">{rezeptById(slot.rezeptId)?.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

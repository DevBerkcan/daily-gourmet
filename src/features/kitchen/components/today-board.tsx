"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ChefHat, Clock3, Play, RotateCcw, Users } from "lucide-react";
import { Button, Card, CardHeader, StatCard } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useProduktionsplanByDatum, useUpdateProduktionsposition, type KitchenWorkStatus } from "@/lib/services/production";
import { aenderungen, geraeteBelegung, workStatusOrder } from "../data";
import { KitchenStatus } from "./kitchen-status";

const HEUTE = "2026-08-06";

export function TodayBoard() {
  const standorte = useStandorte();
  const plan = useProduktionsplanByDatum(HEUTE, standorte[0]?.id ?? "");
  const updateStatus = useUpdateProduktionsposition();

  if (!plan) return null;

  const gesamt = plan.positionen.reduce((summe, position) => summe + position.bestellteMenge + position.zusatzMenge, 0);
  const fertig = plan.positionen.filter((position) => ["FERTIG", "VERPACKT", "ABHOLBEREIT"].includes(position.workStatus)).length;
  const laufend = plan.positionen.filter((position) => position.workStatus === "ZUBEREITUNG").length;

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
            const statusIndex = workStatusOrder.indexOf(position.workStatus);
            const nextStatus = workStatusOrder[Math.min(statusIndex + 1, 3)];
            const portions = position.bestellteMenge + position.zusatzMenge;

            return (
              <Card key={position.id}>
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <KitchenStatus status={position.workStatus} />
                      {(position.startTime || position.finishByTime) && (
                        <span className="text-xs font-medium text-muted">{position.startTime ?? "—"} – {position.finishByTime ?? "—"} Uhr</span>
                      )}
                    </div>
                    <Link href={`/kitchen/plans/${plan.id}/recipes/${position.rezeptId}`} className="mt-2 block font-display text-xl font-semibold text-ink hover:text-basil hover:underline">
                      {position.rezeptName}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5"><Users size={15} aria-hidden /><strong className="text-ink">{portions}</strong> Portionen</span>
                      <span className="inline-flex items-center gap-1.5"><ChefHat size={15} aria-hidden />{position.workstation ?? "Arbeitsplatz nicht festgelegt"}</span>
                      {position.batchCount && (
                        <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden />{position.batchCount} Chargen{position.portionenJeCharge ? ` à ca. ${position.portionenJeCharge}` : ""}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {statusIndex < 3 ? (
                      <Button onClick={() => updateStatus.mutate({ planId: plan.id, itemId: position.id, updates: { workStatus: nextStatus } })}>
                        <Play size={15} aria-hidden /> {nextStatus === "BEREITSTELLUNG" ? "Bereitstellung starten" : nextStatus === "ZUBEREITUNG" ? "Zubereitung starten" : "Fertig melden"}
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => updateStatus.mutate({ planId: plan.id, itemId: position.id, updates: { workStatus: "ZUBEREITUNG" as KitchenWorkStatus } })}><RotateCcw size={15} aria-hidden /> Wieder öffnen</Button>
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
              {geraeteBelegung.map((slot) => {
                const position = plan.positionen.find((p) => p.rezeptId === slot.rezeptId);
                return (
                  <div key={`${slot.zeit}-${slot.geraet}`} className="px-5 py-3.5 text-sm">
                    <div className="flex justify-between gap-3"><span className="font-semibold text-ink">{slot.zeit}</span><span className="text-xs text-muted">{slot.charge}</span></div>
                    <p className="mt-1 text-basil">{slot.geraet}</p><p className="text-xs text-muted">{position?.rezeptName}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

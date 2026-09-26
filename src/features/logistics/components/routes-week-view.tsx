"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, StatusBadge, ACTION_ICONS } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { isoWeekInfo, mondayOfIsoWeek } from "@/lib/isoWeek";
import { useLieferRouten, useWocheDuplizieren, portionenJeRoute, type LieferRoute } from "@/lib/services/logistics";

const WOCHENTAGE_LABEL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, tage: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + tage); return r; };

/** Wochenansicht für Touren (KW → Wochentag → Route) mit Vor-/Zurück-Navigation — Historie ist
 * einfach "eine Woche zurückblättern", Routen werden nie gelöscht. Plus "Woche duplizieren", um eine
 * ähnliche Folgewoche nicht von Hand neu anlegen zu müssen (siehe useWocheDuplizieren). */
export function RoutesWeekView({ onEditRoute }: { onEditRoute: (route: LieferRoute) => void }) {
  const toast = useToast();
  const heuteMontag = useMemo(() => {
    const heute = new Date();
    const info = isoWeekInfo(heute);
    return mondayOfIsoWeek(info.week, info.year);
  }, []);
  const [montag, setMontag] = useState(heuteMontag);
  const info = isoWeekInfo(montag);
  const sonntag = addDays(montag, 6);
  const routen = useLieferRouten({ datumVon: toIso(montag), datumBis: toIso(sonntag) });
  const duplizieren = useWocheDuplizieren();
  const tage = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(montag, i)), [montag]);

  function wocheDuplizieren() {
    const zielMontag = toIso(addDays(montag, 7));
    duplizieren.mutate(
      { quellwocheMontag: toIso(montag), zielwocheMontag: zielMontag },
      {
        onSuccess: (ergebnis) => {
          const uebersprungen = ergebnis?.skippedExisting ?? [];
          toast.success(
            `${ergebnis?.createdCount ?? 0} Route(n) für die Folgewoche angelegt.` +
              (uebersprungen.length > 0 ? ` Übersprungen (bereits vorhanden): ${uebersprungen.join(", ")}.` : "")
          );
        },
        onError: () => toast.error("Woche konnte nicht dupliziert werden. Bitte erneut versuchen."),
      }
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={ChevronLeft} label="Vorherige Woche" showLabel variant="secondary" onClick={() => setMontag((m) => addDays(m, -7))} />
          <h2 className="font-display text-base font-semibold text-ink">KW {info.week}/{info.year}</h2>
          <span className="text-xs text-muted">{montag.toLocaleDateString("de-DE")} – {sonntag.toLocaleDateString("de-DE")}</span>
          <Button icon={ChevronRight} label="Nächste Woche" showLabel variant="secondary" onClick={() => setMontag((m) => addDays(m, 7))} />
          <Button icon={CalendarCheck} label="Heute" showLabel variant="secondary" onClick={() => setMontag(heuteMontag)} />
        </div>
        <Button icon={ACTION_ICONS.template} label="Als Vorlage für nächste Woche" showLabel variant="secondary" loading={duplizieren.isPending} onClick={wocheDuplizieren} />
      </div>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-7">
        {tage.map((tag, i) => {
          const tagIso = toIso(tag);
          const routenDesTages = routen.filter((r) => r.datum === tagIso);
          return (
            <div key={tagIso} className="flex min-h-32 min-w-0 flex-col gap-2 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {WOCHENTAGE_LABEL[i]}<span className="ml-1 font-normal normal-case">{tag.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</span>
              </p>
              {routenDesTages.length === 0 ? (
                <p className="text-xs text-muted">Keine Route</p>
              ) : (
                routenDesTages.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => onEditRoute(route)}
                    className="cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-2 text-left text-xs hover:border-basil hover:bg-basil-soft"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-1"><strong className="min-w-0 break-words text-ink">{route.name}</strong><StatusBadge status={route.status} /></span>
                    <span className="mt-1 block break-words text-muted">{route.fahrerName ?? "Nicht vergeben"} · {portionenJeRoute(route)} Portionen</span>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

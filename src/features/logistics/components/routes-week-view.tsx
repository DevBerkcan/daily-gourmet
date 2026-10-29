"use client";

import { type FormEvent, useMemo, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, StatusBadge, ACTION_ICONS } from "@/components/ui";
import { Modal } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { isoWeekInfo, mondayOfIsoWeek } from "@/lib/isoWeek";
import { useLieferRouten, useWocheDuplizieren, portionenJeRoute, kopierErgebnisText, type LieferRoute } from "@/lib/services/logistics";

const WOCHENTAGE_LABEL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, tage: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + tage); return r; };

/** Ganze Woche (alle Touren Mo–So) in eine wählbare spätere KW übernehmen — die Zielwoche lässt sich
 * danach wie gewohnt anpassen. Gleichnamige Touren am Zieltag werden übersprungen. */
function WocheKopierenDialog({ montag, anzahlRouten, onClose }: { montag: Date; anzahlRouten: number; onClose: () => void }) {
  const toast = useToast();
  const duplizieren = useWocheDuplizieren();
  const ziele = useMemo(() => Array.from({ length: 8 }, (_, i) => addDays(montag, 7 * (i + 1))), [montag]);
  const [ziel, setZiel] = useState(toIso(ziele[0]));
  const quelle = isoWeekInfo(montag);

  function absenden(event: FormEvent) {
    event.preventDefault();
    duplizieren.mutate(
      { quellwocheMontag: toIso(montag), zielwocheMontag: ziel },
      {
        onSuccess: (ergebnis) => { toast.success(kopierErgebnisText(ergebnis)); onClose(); },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : "Woche konnte nicht kopiert werden. Bitte erneut versuchen."),
      }
    );
  }

  return (
    <Modal open onClose={onClose} title={`KW ${quelle.week}/${quelle.year} kopieren`} hint={`${anzahlRouten} Tour(en) mit Fahrer, Abfahrt und Kundenreihenfolge in eine andere Woche übernehmen.`}>
      <form onSubmit={absenden} className="flex flex-col gap-4 p-5">
        <label className="text-xs font-medium text-muted">
          Zielwoche
          <select value={ziel} onChange={(e) => setZiel(e.target.value)} className="mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil">
            {ziele.map((m) => {
              const info = isoWeekInfo(m);
              return <option key={toIso(m)} value={toIso(m)}>KW {info.week}/{info.year} · {m.toLocaleDateString("de-DE", { timeZone: "UTC" })} – {addDays(m, 6).toLocaleDateString("de-DE", { timeZone: "UTC" })}</option>;
            })}
          </select>
        </label>
        <p className="rounded-lg bg-info-soft px-3 py-2 text-xs text-info">Stopps werden mit den Bestellungen und Schließtagen der Zielwoche neu aufgebaut. Bereits vorhandene gleichnamige Touren werden übersprungen.</p>
        <div className="flex justify-end gap-2">
          <Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" showLabel onClick={onClose} />
          <Button icon={ACTION_ICONS.copy} label="Woche kopieren" type="submit" showLabel loading={duplizieren.isPending} />
        </div>
      </form>
    </Modal>
  );
}

/** Wochenplan der Touren (KW → Wochentag → Tour) mit Vor-/Zurück-Navigation. Je Tag lässt sich
 * direkt eine Tour anlegen ("+"), ein Klick auf eine Tour öffnet ihre Details (bearbeiten, auf Tage
 * kopieren …), und die ganze Woche kann als Vorlage in eine andere KW kopiert werden. */
export function RoutesWeekView({ onOpenRoute, onNeueTour }: { onOpenRoute: (route: LieferRoute) => void; onNeueTour: (datumIso: string) => void }) {
  const heuteMontag = useMemo(() => {
    const info = isoWeekInfo(new Date());
    return mondayOfIsoWeek(info.week, info.year);
  }, []);
  const [montag, setMontag] = useState(heuteMontag);
  const [kopierenOffen, setKopierenOffen] = useState(false);
  const info = isoWeekInfo(montag);
  const sonntag = addDays(montag, 6);
  const routen = useLieferRouten({ datumVon: toIso(montag), datumBis: toIso(sonntag) });
  const tage = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(montag, i)), [montag]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={ChevronLeft} label="Vorherige Woche" showLabel variant="secondary" onClick={() => setMontag((m) => addDays(m, -7))} />
          <h2 className="font-display text-base font-semibold text-ink">KW {info.week}/{info.year}</h2>
          <span className="text-xs text-muted">{montag.toLocaleDateString("de-DE", { timeZone: "UTC" })} – {sonntag.toLocaleDateString("de-DE", { timeZone: "UTC" })}</span>
          <Button icon={ChevronRight} label="Nächste Woche" showLabel variant="secondary" onClick={() => setMontag((m) => addDays(m, 7))} />
          <Button icon={CalendarCheck} label="Heute" showLabel variant="secondary" onClick={() => setMontag(heuteMontag)} />
        </div>
        <Button icon={ACTION_ICONS.copy} label="Woche kopieren" showLabel variant="secondary" disabled={routen.length === 0} onClick={() => setKopierenOffen(true)} />
      </div>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-7">
        {tage.map((tag, i) => {
          const tagIso = toIso(tag);
          const routenDesTages = routen.filter((r) => r.datum === tagIso).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <div key={tagIso} className="flex min-h-32 min-w-0 flex-col gap-2 p-3">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {WOCHENTAGE_LABEL[i]}<span className="ml-1 font-normal normal-case">{tag.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "UTC" })}</span>
                </p>
                <Button icon={ACTION_ICONS.create} label={`Tour am ${WOCHENTAGE_LABEL[i]} anlegen`} variant="ghost" size="sm" onClick={() => onNeueTour(tagIso)} />
              </div>
              {routenDesTages.length === 0 ? (
                <p className="text-xs text-muted">Keine Tour</p>
              ) : (
                routenDesTages.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => onOpenRoute(route)}
                    className="cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-2 text-left text-xs hover:border-basil hover:bg-basil-soft"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-1"><strong className="min-w-0 break-words text-ink">{route.name}</strong><StatusBadge status={route.status} /></span>
                    <span className="mt-1 block break-words text-muted">{route.start} Uhr · {route.fahrerName ?? "Nicht vergeben"}</span>
                    <span className="block text-muted">{route.stopps.length} Stopps · {portionenJeRoute(route)} Portionen</span>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
      {kopierenOffen ? <WocheKopierenDialog montag={montag} anzahlRouten={routen.length} onClose={() => setKopierenOffen(false)} /> : null}
    </Card>
  );
}

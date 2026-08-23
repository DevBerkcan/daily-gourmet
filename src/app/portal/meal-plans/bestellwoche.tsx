"use client";

import { useMemo, useState } from "react";
import { PageHeader, Button, Tag, StatusBadge, EmptyState } from "@/components/ui";
import { TextField } from "@/components/ui/form-fields";
import { WeekCalendar, DayColumn, MealTile } from "@/components/meal-plans";
import { usePortalSpeiseplaene, MENUELINIEN } from "@/lib/services/meal-plans";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";
import { useSaveBestellung, useBestellungen, useAdjustBestellungSameDay } from "@/lib/services/orders";
import type { Speiseplan } from "@/features/meal-plans/types";
import type { Rezept } from "@/features/recipes/types";
import type { Bestellung } from "@/lib/types";
import { Save, Send } from "lucide-react";

const heute = "2026-08-06";

/** Anpassung am Liefertag selbst — nur für heutige Positionen einer bereits abgesendeten
 * Bestellung, und nur reduzierbar (siehe useAdjustBestellungSameDay / OrderHandler.AdjustSameDayAsync). */
function TagesAnpassung({ bestellung, rezepte }: { bestellung: Bestellung; rezepte: Rezept[] }) {
  const anpassen = useAdjustBestellungSameDay();
  const heutigePositionen = bestellung.positionen.filter((p) => p.datum === heute && p.id);
  const [werte, setWerte] = useState<Record<string, number>>(() => Object.fromEntries(heutigePositionen.map((p) => [p.id!, p.portionen])));
  const [hinweis, setHinweis] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  if (heutigePositionen.length === 0) return null;
  if (bestellung.status !== "SUBMITTED" && bestellung.status !== "CONFIRMED") return null;

  const geaendert = heutigePositionen.some((p) => (werte[p.id!] ?? p.portionen) !== p.portionen);

  return (
    <div className="mb-4 rounded-card border border-line bg-surface px-5 py-4">
      <p className="mb-2 text-sm font-medium text-ink">Portionen für heute anpassen</p>
      <p className="mb-3 text-xs text-muted">Nur Reduzieren möglich, bis zur tagesaktuellen Frist — bitte kurz begründen (z. B. „5 Kinder krank“).</p>
      <div className="flex flex-col gap-2">
        {heutigePositionen.map((p) => (
          <div key={p.id} className="flex items-center gap-3 text-sm">
            <span className="flex-1 text-muted">{rezepte.find((r) => r.id === p.rezeptId)?.name ?? p.rezeptId}</span>
            <span className="text-xs text-muted">bisher {p.portionen}</span>
            <input
              type="number"
              min={0}
              max={p.portionen}
              value={werte[p.id!] ?? p.portionen}
              onChange={(e) => setWerte((w) => ({ ...w, [p.id!]: Math.min(p.portionen, Math.max(0, Number(e.target.value) || 0)) }))}
              className="min-h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-right text-sm"
              aria-label={`Neue Portionenzahl für ${rezepte.find((r) => r.id === p.rezeptId)?.name ?? p.rezeptId}`}
            />
          </div>
        ))}
      </div>
      {geaendert && (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Begründung" value={hinweis} onChange={setHinweis} placeholder="Grund für die Reduzierung" />
          </div>
          <Button
            disabled={!hinweis.trim() || anpassen.isPending}
            onClick={() =>
              anpassen.mutate(
                {
                  id: bestellung.id,
                  positionen: heutigePositionen
                    .filter((p) => (werte[p.id!] ?? p.portionen) !== p.portionen)
                    .map((p) => ({ positionId: p.id!, portionen: werte[p.id!] ?? p.portionen, hinweis })),
                },
                { onSuccess: () => setGespeichert(true) }
              )
            }
          >
            Anpassung absenden
          </Button>
        </div>
      )}
      {gespeichert && <p className="mt-2 text-sm text-ok">Anpassung wurde übermittelt.</p>}
    </div>
  );
}

export function BestellWoche() {
  const wochen = usePortalSpeiseplaene();
  const bestellungen = useBestellungen();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const [planId, setPlanId] = useState<string>("");
  const aktivePlanId = planId || wochen.find((p) => p.status === "PUBLISHED")?.id || wochen[0]?.id || "";
  const plan = wochen.find((p) => p.id === aktivePlanId);
  const bestellung = plan ? bestellungen.find((eintrag) => eintrag.speiseplanId === plan.id) : undefined;
  const readOnly = plan?.status === "CLOSED" || plan?.status === "ARCHIVED" || bestellung?.status === "LOCKED";

  return (
    <>
      <PageHeader
        title={plan ? `Speiseplan KW ${plan.kalenderwoche}` : "Speiseplan"}
        subtitle="Tragen Sie die Portionsmengen je Gericht ein. Vergangene Tage sind gesperrt; Änderungen sind bis zur Frist möglich."
        actions={
          wochen.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                aria-label="Kalenderwoche wählen"
                value={aktivePlanId}
                onChange={(e) => setPlanId(e.target.value)}
                className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
              >
                {wochen.map((w) => (
                  <option key={w.id} value={w.id}>KW {w.kalenderwoche} / {w.jahr}</option>
                ))}
              </select>
              {plan && <StatusBadge status={plan.status} />}
            </div>
          ) : undefined
        }
      />

      {!plan ? (
        <EmptyState title="Keine Speisepläne verfügbar" text="Für Ihre Einrichtung sind derzeit keine veröffentlichten Speisepläne vorhanden." />
      ) : plan.tage.length === 0 ? (
        <EmptyState title="Keine Tage geplant" text={`Für KW ${plan.kalenderwoche} liegen keine Plandaten vor.`} />
      ) : (
        <WochenTage key={plan.id} plan={plan} bestellung={bestellung} readOnly={readOnly} rezepte={rezepte} zutaten={zutaten} />
      )}
    </>
  );
}

function WochenTage({
  plan,
  bestellung,
  readOnly,
  rezepte,
  zutaten,
}: {
  plan: Speiseplan;
  bestellung: Bestellung | undefined;
  readOnly: boolean;
  rezepte: Rezept[];
  zutaten: ReturnType<typeof useZutaten>;
}) {
  const saveBestellung = useSaveBestellung();
  const initialMengen = useMemo(() => {
    const m: Record<string, number> = {};
    bestellung?.positionen.forEach((pos) => { m[`${pos.datum}|${pos.rezeptId}`] = pos.portionen; });
    return m;
  }, [bestellung]);
  const [mengen, setMengen] = useState<Record<string, number>>(initialMengen);
  const [hinweise, setHinweise] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    bestellung?.positionen.forEach((position) => { if (position.hinweis) initial[position.datum] = position.hinweis; });
    return initial;
  });
  const [gespeichert, setGespeichert] = useState<string | null>(null);

  const gesamt = useMemo(() => Object.values(mengen).reduce((s, n) => s + (n || 0), 0), [mengen]);

  const setMenge = (key: string, value: number) => {
    // Mengen dürfen nicht negativ sein (Prüfung erfolgt zusätzlich serverseitig).
    setMengen((m) => ({ ...m, [key]: Math.max(0, value) }));
    setGespeichert(null);
  };

  const speichern = (submit: boolean) => {
    // Für jedes im Speiseplan angebotene Gericht wird eine Zeile gesendet — auch bei 0 Portionen.
    // So kann das Backend "bewusst 0" (Zeile vorhanden) von "vergessen einzutragen" (keine Zeile)
    // unterscheiden und beim verbindlichen Absenden gezielt nachfragen, statt stillschweigend
    // durchzulassen (siehe Validierung in OrderHandler.SaveAsync).
    const positionen = plan.tage.flatMap((tag) =>
      tag.gerichte.map((gericht) => ({
        datum: tag.datum,
        rezeptId: gericht.rezeptId,
        portionen: mengen[`${tag.datum}|${gericht.rezeptId}`] ?? 0,
        hinweis: hinweise[tag.datum]?.trim() || undefined,
      }))
    );
    saveBestellung.mutate(
      { speiseplanId: plan.id, positionen, submit },
      { onSuccess: () => setGespeichert(submit ? "Bestellung wurde verbindlich abgesendet." : "Entwurf wurde gespeichert.") }
    );
  };

  return (
    <>
      {!readOnly && (
        <div className="mb-4 flex justify-end gap-2 no-print">
          <Button variant="secondary" onClick={() => speichern(false)}><Save size={15} aria-hidden /> Als Entwurf speichern</Button>
          <Button disabled={gesamt === 0} onClick={() => speichern(true)}><Send size={15} aria-hidden /> Verbindlich absenden</Button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-card border border-line bg-surface px-5 py-3 text-sm">
        <span className="text-muted">Bestellte Portionen gesamt:</span>
        <span className="font-display text-xl font-semibold text-basil">{gesamt}</span>
        {bestellung && (
          <span className="ml-auto flex items-center gap-2 text-xs text-muted">
            <StatusBadge status={bestellung.status} />
            {bestellung.abgesendetAm && `letzte Änderung ${bestellung.abgesendetAm}`}
          </span>
        )}
      </div>

      {bestellung && <TagesAnpassung bestellung={bestellung} rezepte={rezepte} />}

      <WeekCalendar>
        {plan.tage.map((tag) => {
          const gesperrt = readOnly || tag.datum < heute;
          return (
            <DayColumn
              key={tag.datum}
              wochentag={tag.wochentag}
              datum={tag.datum}
              isToday={tag.datum === heute}
              locked={gesperrt}
              lockedLabel="Frist abgelaufen"
              hinweis={tag.hinweis}
              footer={
                !gesperrt && (
                  <label className="mt-auto text-xs text-muted">
                    Hinweis zum Tag
                    <input
                      type="text"
                      value={hinweise[tag.datum] ?? ""}
                      onChange={(event) => { setHinweise((aktuell) => ({ ...aktuell, [tag.datum]: event.target.value })); setGespeichert(null); }}
                      placeholder="z. B. Klasse 5b auf Ausflug"
                      className="mt-1 min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil"
                    />
                  </label>
                )
              }
            >
              {MENUELINIEN.map((linie) => {
                const gerichteInLinie = tag.gerichte.filter((g) => g.menuelinie === linie);
                if (gerichteInLinie.length === 0) return null;
                return (
                  <div key={linie} className="flex flex-col gap-1.5">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{linie}</p>
                    {gerichteInLinie.map((gericht) => {
                      const r = rezepte.find((rz) => rz.id === gericht.rezeptId);
                      if (!r) return null;
                      const key = `${tag.datum}|${gericht.rezeptId}`;
                      const allergene = rezeptAllergeneLive(r, zutaten);
                      return (
                        <MealTile
                          key={`${linie}-${gericht.rezeptId}`}
                          rezept={r}
                          tags={
                            <>
                              {r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">veg.</Tag> : null}
                              {allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}
                            </>
                          }
                          footer={
                            <label className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
                              Portionen
                              <input
                                type="number"
                                min={0}
                                disabled={gesperrt}
                                value={mengen[key] ?? 0}
                                onChange={(e) => setMenge(key, Number(e.target.value) || 0)}
                                className="min-h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-right text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil disabled:cursor-not-allowed disabled:bg-line"
                                aria-label={`Portionen für ${r.name} am ${tag.wochentag}`}
                              />
                            </label>
                          }
                        />
                      );
                    })}
                  </div>
                );
              })}
            </DayColumn>
          );
        })}
      </WeekCalendar>

      {gespeichert && <p className="mt-4 text-sm text-ok">{gespeichert}</p>}
    </>
  );
}

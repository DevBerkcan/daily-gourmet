"use client";

import { useMemo, useState } from "react";
import { PageHeader, Button, Tag, StatusBadge, EmptyState } from "@/components/ui";
import { WeekCalendar, DayColumn, MealTile } from "@/components/meal-plans";
import { usePortalSpeiseplaene } from "@/lib/services/meal-plans";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";
import { useSaveBestellung, useBestellungen } from "@/lib/services/orders";
import type { Speiseplan } from "@/features/meal-plans/types";
import type { Rezept } from "@/features/recipes/types";
import type { Bestellung } from "@/lib/types";
import { Save, Send } from "lucide-react";

const heute = "2026-08-06";

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
    const positionen = Object.entries(mengen).flatMap(([key, portionen]) => {
      if (portionen <= 0) return [];
      const [datum, rezeptId] = key.split("|");
      return [{ datum, rezeptId, portionen, hinweis: hinweise[datum]?.trim() || undefined }];
    });
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
              {tag.rezeptIds.map((rid) => {
                const r = rezepte.find((rz) => rz.id === rid);
                if (!r) return null;
                const key = `${tag.datum}|${rid}`;
                const allergene = rezeptAllergeneLive(r, zutaten);
                return (
                  <MealTile
                    key={rid}
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
            </DayColumn>
          );
        })}
      </WeekCalendar>

      {gespeichert && <p className="mt-4 text-sm text-ok">{gespeichert}</p>}
    </>
  );
}

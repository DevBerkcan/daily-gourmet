"use client";

import { useMemo, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Button, ACTION_ICONS, Tag, StatusBadge, EmptyState, LoadingState } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextField } from "@/components/ui/form-fields";
import { WeekCalendar, DayColumn, MealTile } from "@/components/meal-plans";
import { usePortalSpeiseplaene, MENUELINIEN } from "@/lib/services/meal-plans";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";
import { useSaveBestellung, useBestellungen, useAdjustBestellungSameDay } from "@/lib/services/orders";
import { useEinrichtung, usePortalSchliesstage, type EinrichtungSchliesstag } from "@/lib/services/facilities";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import type { Speiseplan } from "@/features/meal-plans/types";
import type { Rezept } from "@/features/recipes/types";
import type { Bestellung } from "@/lib/types";
import { HEUTE as heute } from "@/lib/heute";

const WOCHENTAG_KUERZEL = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const wochentagKuerzel = (datum: string) => WOCHENTAG_KUERZEL[new Date(`${datum}T12:00:00`).getDay()];
const tagLabel = (datum: string) =>
  new Date(`${datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" });
const jetztUhrzeit = () => new Date().toTimeString().slice(0, 5);

/** Anpassung am Liefertag selbst — nur für Einrichtungen mit entsprechender Vereinbarung, nur für
 * heutige Positionen einer bereits abgesendeten Bestellung, nur bis zur Tagesfrist (Standard 9 Uhr)
 * und nur reduzierbar (siehe OrderHandler.AdjustSameDayAsync). Die ursprüngliche Menge bleibt
 * gespeichert (Abrechnung erfolgt auf die reduzierte Menge); die Küche wird per E-Mail informiert. */
function TagesAnpassung({ bestellung, rezepte }: { bestellung: Bestellung; rezepte: Rezept[] }) {
  const anpassen = useAdjustBestellungSameDay();
  const heutigePositionen = bestellung.positionen.filter((p) => p.datum === heute && p.id && (p.portionen > 0 || p.urspruenglichePortionen));
  const [werte, setWerte] = useState<Record<string, number>>(() => Object.fromEntries(heutigePositionen.map((p) => [p.id!, p.portionen])));
  const [hinweis, setHinweis] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  if (!bestellung.tagesanpassungErlaubt) return null;
  if (heutigePositionen.length === 0) return null;
  if (bestellung.status !== "SUBMITTED" && bestellung.status !== "CONFIRMED") return null;

  const frist = bestellung.tagesanpassungFrist ?? "09:00";
  const fristAbgelaufen = jetztUhrzeit() > frist;
  const geaendert = heutigePositionen.some((p) => (werte[p.id!] ?? p.portionen) !== p.portionen);
  const fehler = anpassen.error instanceof ApiError ? anpassen.error.message : anpassen.isError ? "Anpassung fehlgeschlagen. Bitte erneut versuchen." : null;

  return (
    <div className="mb-4 rounded-card border border-line bg-surface px-5 py-4">
      <p className="mb-2 text-sm font-medium text-ink">Portionen für heute reduzieren</p>
      <p className="mb-3 text-xs text-muted">
        {fristAbgelaufen
          ? `Die Frist für heute (${frist} Uhr) ist abgelaufen — Änderungen bitte telefonisch mitteilen.`
          : `Nur Reduzieren möglich, bis heute ${frist} Uhr. Bitte kurz begründen (z. B. „5 Kinder krank“). Die Küche wird automatisch informiert.`}
      </p>
      <div className="flex flex-col gap-3 sm:gap-2">
        {heutigePositionen.map((p) => (
          <div key={p.id} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
            <span className="min-w-0 flex-1 break-words text-muted">{rezepte.find((r) => r.id === p.rezeptId)?.name ?? p.rezeptId}</span>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs text-muted">
              {p.urspruenglichePortionen !== undefined && p.urspruenglichePortionen !== p.portionen
                ? `bestellt ${p.urspruenglichePortionen} · aktuell ${p.portionen}`
                : `bestellt ${p.portionen}`}
            </span>
            <input
              type="number"
              min={0}
              max={p.portionen}
              value={werte[p.id!] ?? p.portionen}
              disabled={fristAbgelaufen}
              onChange={(e) => { setGespeichert(false); setWerte((w) => ({ ...w, [p.id!]: Math.min(p.portionen, Math.max(0, Number(e.target.value) || 0)) })); }}
              className="min-h-9 w-20 shrink-0 rounded-lg border border-line bg-surface px-2.5 text-right text-sm disabled:cursor-not-allowed disabled:bg-line"
              aria-label={`Neue Portionenzahl für ${rezepte.find((r) => r.id === p.rezeptId)?.name ?? p.rezeptId}`}
            />
            </div>
          </div>
        ))}
      </div>
      {geaendert && !fristAbgelaufen && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-48 flex-1">
            <TextField label="Begründung" value={hinweis} onChange={setHinweis} placeholder="Grund für die Reduzierung" />
          </div>
          <Button
            icon={ACTION_ICONS.send}
            label="Anpassung absenden"
            disabled={!hinweis.trim()}
            loading={anpassen.isPending}
            showLabel
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
          />
        </div>
      )}
      {gespeichert && <p className="mt-2 text-sm text-ok">Anpassung wurde übermittelt — die Küche wurde informiert.</p>}
      {fehler && <p className="mt-2 text-sm text-danger">{fehler}</p>}
    </div>
  );
}

export function BestellWoche() {
  const wochen = usePortalSpeiseplaene();
  const bestellungen = useBestellungen();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const { user } = useAuth();
  const einrichtung = useEinrichtung(user?.facilityId);
  const schliesstage = usePortalSchliesstage();
  const [planId, setPlanId] = useState<string>("");
  const aktivePlanId = planId || wochen.find((p) => p.status === "PUBLISHED")?.id || wochen[0]?.id || "";
  const plan = wochen.find((p) => p.id === aktivePlanId);
  const bestellung = plan ? bestellungen.find((eintrag) => eintrag.speiseplanId === plan.id) : undefined;
  const readOnly = plan?.status === "CLOSED" || plan?.status === "ARCHIVED" || bestellung?.status === "LOCKED";
  const ladend = useIsFetching({ queryKey: ["portal-meal-plans"] }) > 0 && wochen.length === 0;

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

      {ladend ? (
        <LoadingState text="Speisepläne werden geladen …" />
      ) : !plan ? (
        <EmptyState title="Keine Speisepläne verfügbar" text="Für Ihre Einrichtung sind derzeit keine veröffentlichten Speisepläne vorhanden." />
      ) : plan.tage.length === 0 ? (
        <EmptyState title="Keine Tage geplant" text={`Für KW ${plan.kalenderwoche} liegen keine Plandaten vor.`} />
      ) : (
        <WochenTage
          key={plan.id}
          plan={plan}
          bestellung={bestellung}
          readOnly={readOnly}
          rezepte={rezepte}
          zutaten={zutaten}
          aktiveWochentage={einrichtung?.aktiveWochentage}
          schliesstage={schliesstage}
        />
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
  aktiveWochentage,
  schliesstage,
}: {
  plan: Speiseplan;
  bestellung: Bestellung | undefined;
  readOnly: boolean;
  rezepte: Rezept[];
  zutaten: ReturnType<typeof useZutaten>;
  /** Liefertage der Einrichtung ("Mo", "Di", …) — undefined solange noch nicht geladen. */
  aktiveWochentage: string[] | undefined;
  schliesstage: EinrichtungSchliesstag[];
}) {
  const schliesstagFuer = (datum: string) => schliesstage.find((s) => s.von <= datum && datum <= s.bis);
  // Ein Tag ist "relevant", wenn die Einrichtung an diesem Wochentag beliefert wird und kein
  // Schließtag eingetragen ist — dieselbe Regel wie im Backend (OrderDeadline.IsDeliveryDay).
  const istLiefertag = (datum: string) =>
    !schliesstagFuer(datum) && (!aktiveWochentage || aktiveWochentage.length === 0 || aktiveWochentage.includes(wochentagKuerzel(datum)));
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
  const [absendenBestaetigung, setAbsendenBestaetigung] = useState<string[] | null>(null);

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
      { onSuccess: () => setGespeichert(submit ? "Bestellung wurde abgesendet." : "Entwurf wurde gespeichert.") }
    );
  };

  // Bestellkontrolle: "Absenden" fragt immer noch einmal nach — und listet gezielt die Liefertage
  // auf, für die insgesamt keine einzige Portion eingetragen ist (meist schlicht vergessen).
  // Schließtage und Wochentage ohne Belieferung zählen nicht als fehlend. Einzelne Gerichte mit 0
  // sind normal (mehrere Menülinien pro Tag) und lösen keine Warnung aus.
  const absendenAnklicken = () => {
    const fehlendeTage = plan.tage
      .filter((tag) => tag.datum >= heute && tag.gerichte.length > 0 && istLiefertag(tag.datum))
      .filter((tag) => tag.gerichte.every((gericht) => (mengen[`${tag.datum}|${gericht.rezeptId}`] ?? 0) === 0))
      .map((tag) => tagLabel(tag.datum));
    setAbsendenBestaetigung(fehlendeTage);
  };

  return (
    <>
      {!readOnly && (
        <div className="mb-4 flex flex-wrap justify-end gap-2 no-print">
          <Button variant="secondary" onClick={() => speichern(false)} icon={ACTION_ICONS.save} label="Als Entwurf speichern" showLabel />
          <Button disabled={gesamt === 0} onClick={absendenAnklicken} icon={ACTION_ICONS.send} label="Absenden" showLabel />
        </div>
      )}

      <ConfirmDialog
        open={absendenBestaetigung !== null}
        title="Bestellung absenden?"
        tone={absendenBestaetigung && absendenBestaetigung.length > 0 ? "warn" : "default"}
        confirmLabel={absendenBestaetigung && absendenBestaetigung.length > 0 ? "Trotzdem absenden" : "Ja, absenden"}
        confirmIcon={ACTION_ICONS.send}
        onCancel={() => setAbsendenBestaetigung(null)}
        onConfirm={() => { setAbsendenBestaetigung(null); speichern(true); }}
        message={
          absendenBestaetigung && absendenBestaetigung.length > 0 ? (
            <>
              <p>Für folgende Liefertage ist noch <strong>keine Bestellung</strong> eingetragen:</p>
              <ul className="my-3 list-disc space-y-1 pl-5">
                {absendenBestaetigung.map((eintrag) => <li key={eintrag}>{eintrag}</li>)}
              </ul>
              <p>
                Eingetragene Schließtage sind bereits berücksichtigt. Falls Ihre Einrichtung an diesen Tagen geschlossen ist,
                tragen Sie die Schließtage bitte im Profil ein. Trotzdem absenden?
              </p>
            </>
          ) : (
            <p>Möchten Sie diese Bestellung jetzt absenden? Änderungen sind danach nur noch bis zur Frist möglich.</p>
          )
        }
      />

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
          const schliesstag = schliesstagFuer(tag.datum);
          const gesperrt = readOnly || tag.datum < heute || !!schliesstag;
          const tagHinweis = schliesstag
            ? `Geschlossen (Schließtag${schliesstag.hinweis ? `: ${schliesstag.hinweis}` : ""}) — keine Bestellung nötig.`
            : tag.hinweis;
          return (
            <DayColumn
              key={tag.datum}
              wochentag={tag.wochentag}
              datum={tag.datum}
              isToday={tag.datum === heute}
              locked={gesperrt}
              lockedLabel={schliesstag ? "Geschlossen" : "Frist abgelaufen"}
              hinweis={tagHinweis}
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
                            <label className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                              Portionen
                              <input
                                type="number"
                                min={0}
                                disabled={gesperrt}
                                value={mengen[key] ?? 0}
                                onChange={(e) => setMenge(key, Number(e.target.value) || 0)}
                                className="min-h-9 w-20 shrink-0 rounded-lg border border-line bg-surface px-2.5 text-right text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil disabled:cursor-not-allowed disabled:bg-line"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StatusBadge, Button, Tag, EmptyState } from "@/components/ui";
import { WeekCalendar, DayColumn, MealTile } from "@/components/meal-plans";
import { useEinrichtungen } from "@/lib/services/facilities";
import type { Speiseplan, SpeiseplanTag } from "../types";
import type { Rezept } from "@/features/recipes/types";
import { Eye, Send, X } from "lucide-react";
import {
  useSpeiseplaene,
  useUpdateSpeiseplanTag,
  useSubmitReviewSpeiseplan,
  usePublishSpeiseplan,
  useUnpublishSpeiseplan,
} from "@/lib/services/meal-plans";
import { useBestellungen } from "@/lib/services/orders";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";

const HEUTE = "2026-08-06";
const BINDENDE_STATUS = ["SUBMITTED", "CONFIRMED", "LOCKED"];

function TagRezeptHinzufuegen({
  plan,
  tag,
  rezepte,
}: {
  plan: Speiseplan;
  tag: SpeiseplanTag;
  rezepte: Rezept[];
}) {
  const [offen, setOffen] = useState(false);
  const updateTag = useUpdateSpeiseplanTag();
  const verfuegbar = rezepte.filter((r) => !tag.rezeptIds.includes(r.id));

  if (verfuegbar.length === 0) return null;

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="mt-1 cursor-pointer rounded-lg border border-dashed border-line-strong py-1.5 text-xs font-medium text-muted hover:border-basil hover:text-basil no-print"
      >
        + Gericht hinzufügen
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5 no-print">
      <select
        autoFocus
        aria-label={`Rezept für ${tag.wochentag} hinzufügen`}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value && tag.id) {
            updateTag.mutate({ plan, tagId: tag.id, rezeptIds: [...tag.rezeptIds, e.target.value], hinweis: tag.hinweis });
            setOffen(false);
          }
        }}
        className="min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm"
      >
        <option value="" disabled>Rezept wählen …</option>
        {verfuegbar.map((r) => (
          <option key={r.id} value={r.id}>{r.name} · {r.kategorie}</option>
        ))}
      </select>
      <button type="button" onClick={() => setOffen(false)} className="cursor-pointer text-left text-xs text-muted hover:text-ink hover:underline">
        Abbrechen
      </button>
    </div>
  );
}

export function PlanDetail({ id }: { id: string }) {
  const plaene = useSpeiseplaene();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const einrichtungen = useEinrichtungen();
  const bestellungen = useBestellungen({ speiseplanId: id });
  const plan = plaene.find((p) => p.id === id);
  const updateTag = useUpdateSpeiseplanTag();
  const submitReview = useSubmitReviewSpeiseplan();
  const publish = usePublishSpeiseplan();
  const unpublish = useUnpublishSpeiseplan();

  const umsatz = bestellungen
    .filter((b) => BINDENDE_STATUS.includes(b.status))
    .reduce((summe, b) => {
      const einrichtung = einrichtungen.find((e) => e.id === b.einrichtungId);
      const portionen = b.positionen.reduce((s, p) => s + p.portionen, 0);
      return summe + portionen * (einrichtung?.portionspreis ?? 0);
    }, 0);

  const bearbeitbar = plan?.status === "DRAFT" || plan?.status === "REVIEW";

  if (!plan) {
    return (
      <Card>
        <EmptyState
          title="Speiseplan nicht gefunden"
          text="Dieser Wochenplan existiert nicht (mehr)."
          action={<Button href="/admin/meal-plans">Zurück zur Übersicht</Button>}
        />
      </Card>
    );
  }

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/meal-plans" className="hover:text-basil hover:underline">Speisepläne</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">KW {plan.kalenderwoche} / {plan.jahr}</span>
      </nav>

      <PageHeader
        title={`Speiseplan KW ${plan.kalenderwoche}`}
        subtitle={`Veröffentlicht für: ${plan.einrichtungIds.map((f) => einrichtungen.find((e) => e.id === f)?.name).join(", ") || "—"}`}
        actions={
          <>
            <Button variant="secondary" href="/portal/meal-plans"><Eye size={15} aria-hidden /> Vorschau als Einrichtung</Button>
            {plan.status === "DRAFT" && <Button onClick={() => submitReview.mutate(plan.id)}><Send size={15} aria-hidden /> Zur Prüfung senden</Button>}
            {plan.status === "REVIEW" && <Button onClick={() => publish.mutate(plan.id)}><Send size={15} aria-hidden /> Veröffentlichen</Button>}
            {plan.status === "PUBLISHED" && <Button variant="secondary" onClick={() => unpublish.mutate(plan.id)}>Veröffentlichung zurückziehen</Button>}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={plan.status} />
        {umsatz > 0 && (
          <span className="text-sm text-muted">
            Umsatz (bestätigte Bestellungen): <span className="font-semibold text-basil">{umsatz.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
          </span>
        )}
      </div>

      {plan.tage.length === 0 ? (
        <Card>
          <EmptyState
            title="Noch keine Tage geplant"
            text="Dieser Wochenplan enthält noch keine Gerichte."
          />
        </Card>
      ) : (
        <WeekCalendar>
          {plan.tage.map((tag) => (
            <DayColumn
              key={tag.datum}
              wochentag={tag.wochentag}
              datum={tag.datum}
              isToday={tag.datum === HEUTE}
              hinweis={tag.hinweis}
              footer={bearbeitbar && <TagRezeptHinzufuegen plan={plan} tag={tag} rezepte={rezepte} />}
            >
              {tag.rezeptIds.map((rid) => {
                const r = rezepte.find((rz) => rz.id === rid);
                if (!r) return null;
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
                    aside={
                      bearbeitbar && (
                        <button
                          type="button"
                          onClick={() => tag.id && updateTag.mutate({ plan, tagId: tag.id, rezeptIds: tag.rezeptIds.filter((x) => x !== rid), hinweis: tag.hinweis })}
                          aria-label={`${r.name} entfernen`}
                          className="cursor-pointer text-muted hover:text-danger no-print"
                        >
                          <X size={14} aria-hidden />
                        </button>
                      )
                    }
                  />
                );
              })}
            </DayColumn>
          ))}
        </WeekCalendar>
      )}
    </>
  );
}

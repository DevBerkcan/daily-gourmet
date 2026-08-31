"use client";

import { useState } from "react";
import Link from "next/link";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Card, StatusBadge, Button, Tag, EmptyState, LoadingState } from "@/components/ui";
import { WeekCalendar, DayColumn, MealTile } from "@/components/meal-plans";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useToast } from "@/components/ui/toast";
import { PromptDialog } from "@/components/ui/confirm-dialog";
import { MarkAsTemplateDialog } from "./mark-as-template-dialog";
import type { Speiseplan, SpeiseplanTag, Menuelinie } from "../types";
import { MENUELINIEN } from "../types";
import type { Rezept } from "@/features/recipes/types";
import { AlertTriangle, BookmarkPlus, Eye, Send, X } from "lucide-react";
import {
  useSpeiseplaene,
  useUpdateSpeiseplanTag,
  useSubmitReviewSpeiseplan,
  usePublishSpeiseplan,
  useUnpublishSpeiseplan,
  useMarkAsTemplate,
  useRejectSpeiseplan,
  useRemoveFacilityFromPlan,
} from "@/lib/services/meal-plans";
import { useBestellungen } from "@/lib/services/orders";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";

const HEUTE = "2026-08-06";
const BINDENDE_STATUS = ["SUBMITTED", "CONFIRMED", "LOCKED"];

function TagRezeptHinzufuegen({
  plan,
  tag,
  menuelinie,
  rezepte,
}: {
  plan: Speiseplan;
  tag: SpeiseplanTag;
  menuelinie: Menuelinie;
  rezepte: Rezept[];
}) {
  const [offen, setOffen] = useState(false);
  const [ernaehrungsFilter, setErnaehrungsFilter] = useState<"alle" | "vegan" | "vegetarisch" | "glutenfrei">("alle");
  const updateTag = useUpdateSpeiseplanTag();
  const inDieserLinie = new Set(tag.gerichte.filter((g) => g.menuelinie === menuelinie).map((g) => g.rezeptId));
  const auswaehlbar = rezepte.filter((r) => !inDieserLinie.has(r.id));
  const verfuegbar = auswaehlbar.filter((r) => {
    if (ernaehrungsFilter === "vegan") return r.vegan;
    if (ernaehrungsFilter === "vegetarisch") return r.vegetarisch || r.vegan;
    if (ernaehrungsFilter === "glutenfrei") return !!r.glutenfrei;
    return true;
  });

  if (auswaehlbar.length === 0) return null;

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

  const filterOptionen: { value: typeof ernaehrungsFilter; label: string }[] = [
    { value: "alle", label: "Alle" },
    { value: "vegan", label: "Vegan" },
    { value: "vegetarisch", label: "Vegetarisch" },
    { value: "glutenfrei", label: "Glutenfrei" },
  ];

  return (
    <div className="mt-1 flex flex-col gap-1.5 no-print">
      <div className="flex flex-wrap gap-1">
        {filterOptionen.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setErnaehrungsFilter(f.value)}
            className={`cursor-pointer rounded-full border px-2 py-0.5 text-[11px] font-medium ${ernaehrungsFilter === f.value ? "border-basil bg-basil-soft text-basil-deep" : "border-line text-muted hover:border-line-strong hover:text-ink"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select
        autoFocus
        aria-label={`Rezept für ${tag.wochentag} (${menuelinie}) hinzufügen`}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value && tag.id) {
            updateTag.mutate({ plan, tagId: tag.id, gerichte: [...tag.gerichte, { rezeptId: e.target.value, menuelinie }], hinweis: tag.hinweis });
            setOffen(false);
          }
        }}
        className="min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm"
      >
        <option value="" disabled>Rezept wählen …</option>
        {verfuegbar.length === 0 ? (
          <option value="" disabled>Keine Rezepte für diesen Filter</option>
        ) : (
          verfuegbar.map((r) => {
            const tags = [r.vegan ? "vegan" : r.vegetarisch ? "vegetarisch" : null, r.glutenfrei ? "glutenfrei" : null].filter(Boolean).join(", ");
            return <option key={r.id} value={r.id}>{r.name} · {r.kategorie}{tags ? ` · ${tags}` : ""}</option>;
          })
        )}
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
  const ladend = useIsFetching({ queryKey: ["meal-plans"] }) > 0 && plaene.length === 0;
  const updateTag = useUpdateSpeiseplanTag();
  const submitReview = useSubmitReviewSpeiseplan();
  const publish = usePublishSpeiseplan();
  const unpublish = useUnpublishSpeiseplan();
  const markAsTemplate = useMarkAsTemplate();
  const reject = useRejectSpeiseplan();
  const removeFacility = useRemoveFacilityFromPlan();
  const toast = useToast();
  const [vorlagenDialogOffen, setVorlagenDialogOffen] = useState(false);
  const [ablehnenDialogOffen, setAblehnenDialogOffen] = useState(false);

  const vorlageAnlegen = (slot: number) => {
    if (!plan) return;
    markAsTemplate.mutate(
      { id: plan.id, vorlagenSlot: slot },
      {
        onSuccess: () => { setVorlagenDialogOffen(false); toast.success(`Vorlage ${slot} angelegt.`); },
        onError: () => toast.error("Vorlage konnte nicht angelegt werden."),
      }
    );
  };

  const planAblehnen = (grund: string) => {
    if (!plan) return;
    reject.mutate(
      { id: plan.id, grund },
      {
        onSuccess: () => { setAblehnenDialogOffen(false); toast.success("Wochenplan abgelehnt."); },
        onError: () => toast.error("Ablehnen fehlgeschlagen. Bitte erneut versuchen."),
      }
    );
  };

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
        {ladend ? (
          <LoadingState text="Speiseplan wird geladen …" />
        ) : (
          <EmptyState
            title="Speiseplan nicht gefunden"
            text="Dieser Wochenplan existiert nicht (mehr)."
            action={<Button href="/admin/meal-plans">Zurück zur Übersicht</Button>}
          />
        )}
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
        subtitle={plan.einrichtungIds.length === 0 ? "Vorlage — keiner Einrichtung zugeordnet" : `Veröffentlicht für ${plan.einrichtungIds.length} Einrichtung${plan.einrichtungIds.length > 1 ? "en" : ""}`}
        actions={
          <>
            <Button variant="secondary" href="/portal/meal-plans"><Eye size={15} aria-hidden /> Vorschau als Einrichtung</Button>
            <Button variant="secondary" onClick={() => setVorlagenDialogOffen(true)}><BookmarkPlus size={15} aria-hidden /> Als Vorlage markieren</Button>
            {plan.status === "DRAFT" && <Button onClick={() => submitReview.mutate(plan.id)}><Send size={15} aria-hidden /> Zur Prüfung senden</Button>}
            {plan.status === "REVIEW" && <Button onClick={() => publish.mutate(plan.id)}><Send size={15} aria-hidden /> Veröffentlichen</Button>}
            {plan.status === "REVIEW" && <Button variant="secondary" onClick={() => setAblehnenDialogOffen(true)}>Ablehnen</Button>}
            {plan.status === "PUBLISHED" && <Button variant="secondary" onClick={() => unpublish.mutate(plan.id)}>Veröffentlichung zurückziehen</Button>}
          </>
        }
      />

      {plan.einrichtungIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 no-print">
          {plan.einrichtungIds.map((eid) => {
            const name = einrichtungen.find((e) => e.id === eid)?.name ?? "—";
            const kannEntfernen = bearbeitbar && plan.einrichtungIds.length > 1;
            return (
              <span key={eid} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink">
                {name}
                {kannEntfernen && (
                  <button
                    type="button"
                    onClick={() => removeFacility.mutate({ id: plan.id, einrichtungId: eid }, { onError: () => toast.error("Einrichtung konnte nicht entfernt werden.") })}
                    aria-label={`${name} von diesem Plan entfernen`}
                    className="cursor-pointer text-muted hover:text-danger"
                  >
                    <X size={12} aria-hidden />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={plan.status} />
        {umsatz > 0 && (
          <span className="text-sm text-muted">
            Umsatz (bestätigte Bestellungen): <span className="font-semibold text-basil">{umsatz.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
          </span>
        )}
      </div>

      {plan.ablehnungsgrund && (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <div>
            <p className="font-medium">Dieser Plan wurde abgelehnt und zur Überarbeitung zurückgeschickt.</p>
            <p className="mt-0.5 text-ink-soft">{plan.ablehnungsgrund}</p>
          </div>
        </div>
      )}

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
            >
              {MENUELINIEN.map((linie) => {
                const gerichteInLinie = tag.gerichte.filter((g) => g.menuelinie === linie);
                return (
                  <div key={linie} className="flex flex-col gap-1.5">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{linie}</p>
                    {gerichteInLinie.map((gericht) => {
                      const r = rezepte.find((rz) => rz.id === gericht.rezeptId);
                      if (!r) return null;
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
                          aside={
                            bearbeitbar && (
                              <button
                                type="button"
                                onClick={() =>
                                  tag.id &&
                                  updateTag.mutate({
                                    plan,
                                    tagId: tag.id,
                                    gerichte: tag.gerichte.filter((g) => !(g.rezeptId === gericht.rezeptId && g.menuelinie === linie)),
                                    hinweis: tag.hinweis,
                                  })
                                }
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
                    {bearbeitbar && <TagRezeptHinzufuegen plan={plan} tag={tag} menuelinie={linie} rezepte={rezepte} />}
                  </div>
                );
              })}
            </DayColumn>
          ))}
        </WeekCalendar>
      )}

      <MarkAsTemplateDialog
        open={vorlagenDialogOffen}
        onConfirm={vorlageAnlegen}
        onCancel={() => setVorlagenDialogOffen(false)}
        submitting={markAsTemplate.isPending}
      />
      <PromptDialog
        open={ablehnenDialogOffen}
        title="Wochenplan ablehnen"
        message={<p>Der Plan wird zurück in den Entwurf gesendet. Der Grund wird hier angezeigt und die übrigen Administratoren werden per E-Mail informiert.</p>}
        label="Grund der Ablehnung"
        placeholder="z. B. Menülinie Alternativ fehlt an zwei Tagen"
        confirmLabel="Ablehnen"
        onCancel={() => setAblehnenDialogOffen(false)}
        onConfirm={planAblehnen}
      />
    </>
  );
}

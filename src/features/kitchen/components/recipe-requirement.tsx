"use client";

import Link from "next/link";
import { ArrowLeft, Boxes, ChefHat, Clock3, MapPin, Scale, Users } from "lucide-react";
import { Card, CardHeader, PageHeader, Table, Td, Button, EmptyState } from "@/components/ui";
import { useZutaten } from "@/lib/services/ingredients";
import { useRezepte } from "@/lib/services/recipes";
import { useProduktionsplaene } from "@/lib/services/production";
import { PrintButton } from "./print-button";
import { RecipeWorkActions } from "./recipe-work-actions";
import { CompletionReport } from "./completion-report";
import { einrichtungsName, verpackungsPositionen } from "../data";

function rundeMenge(menge: number) {
  return Math.round(menge * 100) / 100;
}

export function RecipeRequirement({ planId, recipeId }: { planId: string; recipeId: string }) {
  const plaene = useProduktionsplaene();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const plan = plaene.find((eintrag) => eintrag.id === planId);
  const position = plan?.positionen.find((eintrag) => eintrag.rezeptId === recipeId);
  const rezept = rezepte.find((r) => r.id === recipeId);

  if (!plan || !position || !rezept) {
    return (
      <Card>
        <EmptyState title="Gericht nicht gefunden" text="Dieser Produktionsauftrag existiert nicht (mehr)." action={<Button href="/kitchen/plans">Zurück zu den Produktionsplänen</Button>} />
      </Card>
    );
  }

  const portionen = position.bestellteMenge + position.zusatzMenge;
  const faktor = rezept.standardPortionen > 0 ? portionen / rezept.standardPortionen : 0;
  const ausgaben = verpackungsPositionen.filter((eintrag) => eintrag.rezeptId === recipeId);
  const datum = new Date(`${plan.datum}T12:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-4 no-print">
        <Link href="/kitchen/plans" className="inline-flex items-center gap-1.5 text-sm font-medium text-basil hover:underline">
          <ArrowLeft size={15} aria-hidden /> Zurück zu den Produktionsplänen
        </Link>
      </nav>

      <PageHeader
        title={rezept.name}
        subtitle={`${datum} · ${plan.standortName}`}
        actions={<PrintButton />}
      />

      <RecipeWorkActions planId={plan.id} position={position} />

      <div className="my-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-3 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-basil-soft text-basil"><Users size={19} aria-hidden /></span>
          <div><p className="text-xs text-muted">Zu produzieren</p><p className="font-display text-2xl font-semibold text-ink">{portionen} Portionen</p></div>
        </Card>
        <Card className="flex items-center gap-3 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-saffron-soft text-saffron"><Clock3 size={19} aria-hidden /></span>
          <div><p className="text-xs text-muted">Zubereitungszeit</p><p className="font-display text-2xl font-semibold text-ink">{rezept.zubereitungszeitMin} Min.</p></div>
        </Card>
        <Card className="flex items-center gap-3 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-ok-soft text-ok"><ChefHat size={19} aria-hidden /></span>
          <div><p className="text-xs text-muted">Arbeitsplatz</p><p className="mt-1 font-semibold text-ink">{position.workstation ?? "Nicht festgelegt"}</p></div>
        </Card>
        <Card className="flex items-center gap-3 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-info-soft text-info"><Boxes size={19} aria-hidden /></span>
          <div><p className="text-xs text-muted">Chargen & Gerät</p><p className="mt-1 font-semibold text-ink">{position.batchCount ?? 1} × {position.equipment ?? "Nicht festgelegt"}</p></div>
        </Card>
      </div>

      {(position.startTime || position.finishByTime || position.verantwortlich) ? (
        <Card className="mb-6">
          <CardHeader title="Produktionsauftrag" hint={position.verantwortlich ? `Verantwortlich: ${position.verantwortlich}` : undefined} />
          <div className="grid gap-4 px-5 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-muted">Produktionsstart</p><p className="mt-1 font-semibold text-ink">{position.startTime ? `${position.startTime} Uhr` : "—"}</p></div>
            <div><p className="text-xs text-muted">Fertig bis</p><p className="mt-1 font-semibold text-ink">{position.finishByTime ? `${position.finishByTime} Uhr` : "—"}</p></div>
            <div><p className="text-xs text-muted">Chargengröße</p><p className="mt-1 font-semibold text-ink">{position.portionenJeCharge ? `ca. ${position.portionenJeCharge} Portionen` : "—"}</p></div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="h-fit">
          <CardHeader
            title="Benötigte Zutaten"
            hint={`Automatisch hochgerechnet von ${rezept.standardPortionen} auf ${portionen} Portionen`}
            actions={<Scale size={18} className="text-basil" aria-hidden />}
          />
          <Table head={["Zutat", `Menge für ${portionen} Portionen`, "Rezeptbasis"]}>
            {rezept.zutaten.map((rezeptZutat) => {
              const zutat = zutaten.find((z) => z.id === rezeptZutat.zutatId);
              const bedarf = rundeMenge(rezeptZutat.menge * faktor);

              return (
                <tr key={rezeptZutat.zutatId}>
                  <Td>
                    <p className="font-semibold text-ink">{zutat?.name}</p>
                    {zutat?.allergene.length ? <p className="mt-0.5 text-xs text-warn">Allergene: {zutat.allergene.join(", ")}</p> : null}
                  </Td>
                  <Td className="font-display text-lg font-semibold text-basil">
                    {bedarf.toLocaleString("de-DE", { maximumFractionDigits: 2 })} {rezeptZutat.einheit}
                  </Td>
                  <Td className="text-xs text-muted">
                    {rezeptZutat.menge.toLocaleString("de-DE")} {rezeptZutat.einheit} / {rezept.standardPortionen} Port.
                  </Td>
                </tr>
              );
            })}
          </Table>
        </Card>

        <div className="flex flex-col gap-6">
          {ausgaben.length ? <Card><CardHeader title="Verpackung & Ausgabe" hint={`${ausgaben.reduce((summe, ausgabe) => summe + ausgabe.portionen, 0)} Portionen auf ${ausgaben.length} Ziele verteilen`} /><div className="divide-y divide-line">{ausgaben.map((ausgabe) => <div key={ausgabe.id} className="flex items-start justify-between gap-4 px-5 py-3.5 text-sm"><div><p className="inline-flex items-center gap-1.5 font-semibold text-ink"><MapPin size={14} className="text-basil" aria-hidden />{einrichtungsName(ausgabe.einrichtungId)}</p><p className="mt-1 text-xs text-muted">{ausgabe.behaelter} · Ausgabe {ausgabe.ausgabe} · {ausgabe.hinweis}</p></div><p className="font-display text-lg font-semibold text-basil">{ausgabe.portionen}</p></div>)}</div></Card> : null}
          <Card>
            <CardHeader title="Zubereitung" hint={rezept.produktionshinweise} />
            <ol className="divide-y divide-line">
              {rezept.zubereitungsschritte.map((schritt, index) => (
                <li key={`${index}-${schritt}`} className="flex gap-4 px-5 py-4 text-sm leading-relaxed">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-basil-soft font-display text-sm font-semibold text-basil">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-ink">{schritt}</span>
                </li>
              ))}
            </ol>
          </Card>

          {(rezept.kerntemperaturC != null || rezept.lagerhinweis || rezept.haltbarkeitNachZubereitung) && (
            <Card>
              <CardHeader title="Küchen- & HACCP-Hinweise" />
              <dl className="divide-y divide-line text-sm">
                {rezept.kerntemperaturC != null && <div className="flex justify-between gap-4 px-5 py-3"><dt className="text-muted">Kerntemperatur</dt><dd className="font-medium text-ink">{rezept.kerntemperaturC} °C</dd></div>}
                {rezept.lagerhinweis && <div className="px-5 py-3"><dt className="text-muted">Lagerhinweis</dt><dd className="mt-1 font-medium text-ink">{rezept.lagerhinweis}</dd></div>}
                {rezept.haltbarkeitNachZubereitung && <div className="px-5 py-3"><dt className="text-muted">Haltbarkeit</dt><dd className="mt-1 font-medium text-ink">{rezept.haltbarkeitNachZubereitung}</dd></div>}
              </dl>
            </Card>
          )}
          <CompletionReport planId={plan.id} itemId={position.id} sollMenge={portionen} />
        </div>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, MapPin, Thermometer, Truck, Undo2 } from "lucide-react";
import { ACTION_ICONS, Button, Card, EmptyState, LoadingState, PageHeader, StatCard } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog, PromptDialog } from "@/components/ui/confirm-dialog";
import {
  useLieferRoute, useLieferRouten, useFahrer, useUpdateStoppStatus, useAdvanceRouteStatus,
  useRouteAbgeben, useStoppUebertragen, portionenJeRoute,
  fahrzeugLabel,
} from "@/lib/services/logistics";

const SUBTITLE = "Stopps der Reihe nach anfahren und jede Zustellung bestätigen.";
/** Stopp-Aktionen ab `lg` untereinander, alle gleich breit und linksbündig (Spalte ist 280px). */
const AKTION_CLS = "lg:w-full! lg:justify-start";

function Breadcrumb() {
  return (
    <nav aria-label="Brotkrumen" className="mb-4">
      <Button icon={ACTION_ICONS.back} label="Zurück zu meinen Touren" showLabel href="/driver/routes" variant="ghost" />
    </nav>
  );
}

export function DriverRouteDetail({ id }: { id: string }) {
  const router = useRouter();
  // Sobald die Abgabe bestätigt wurde, hat dieser Fahrer bald keinen Zugriff mehr auf die Route —
  // die Detailabfrage wird deshalb sofort abgeschaltet, statt sich auf Cache-Invalidierung/Timing zu
  // verlassen (die Komponente bleibt bis zur Navigation noch kurz gemountet und würde sonst beim
  // nächsten Render sofort neu abfragen und mit 403 scheitern).
  const [routeWirdAbgegeben, setRouteWirdAbgegeben] = useState(false);
  const route = useLieferRoute(id, !routeWirdAbgegeben);
  const fahrer = useFahrer();
  const updateStoppStatus = useUpdateStoppStatus();
  const advanceRouteStatus = useAdvanceRouteStatus();
  const routeAbgeben = useRouteAbgeben();
  const stoppUebertragen = useStoppUebertragen();
  const routenAmSelbenTag = useLieferRouten({ datum: route?.datum });
  const toast = useToast();
  const [problemStoppId, setProblemStoppId] = useState<string | null>(null);
  const [routeAbgebenBestaetigen, setRouteAbgebenBestaetigen] = useState(false);
  const [transferStoppId, setTransferStoppId] = useState<string | null>(null);
  const [zielRouteId, setZielRouteId] = useState("");
  const ladend = useIsFetching({ queryKey: ["route", id] }) > 0 && !route;

  if (!route) {
    return (
      <>
        <Breadcrumb />
        <PageHeader title="Routenansicht" subtitle={SUBTITLE} />
        <Card>
          {ladend ? (
            <LoadingState text="Route wird geladen …" />
          ) : (
            <EmptyState title="Route nicht gefunden" text="Diese Route ist nicht mehr verfügbar." action={<Button icon={ACTION_ICONS.open} label="Zu meinen Touren" showLabel href="/driver/routes" />} />
          )}
        </Card>
      </>
    );
  }

  const person = fahrer.find((f) => f.id === route.fahrerId);
  const zugestellt = route.stopps.filter((stopp) => stopp.status === "ZUGESTELLT").length;
  const alleZugestellt = zugestellt === route.stopps.length;
  const stoppWirdAktualisiert = (stoppId: string) => updateStoppStatus.isPending && updateStoppStatus.variables?.stoppId === stoppId;
  // Übergabeziele: andere, bereits übernommene Routen desselben Tages, außer der eigenen.
  const andereRoutenAmTag = routenAmSelbenTag.filter((r) => r.id !== route.id && r.fahrerId && r.status !== "ABGESCHLOSSEN");

  return (
    <>
      <Breadcrumb />
      <PageHeader title={route.name} subtitle={SUBTITLE} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Fortschritt" value={`${zugestellt} / ${route.stopps.length} Stopps`} tone={alleZugestellt ? "ok" : "default"} />
        <StatCard label="Ladung" value={`${portionenJeRoute(route)} Portionen`} />
        <StatCard label="Geplante Rückkehr" value={route.rueckkehr ? `${route.rueckkehr} Uhr` : "—"} hint={route.kilometer != null ? `${route.kilometer} km Gesamtroute` : undefined} />
      </div>

      <Card className="my-6"><div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink"><Truck size={17} className="shrink-0 text-basil" aria-hidden />{fahrzeugLabel(person)}</p><p className="mt-1 text-xs text-muted">Abfahrt {route.start} Uhr · Fahrer {person?.name}</p></div><div className="flex flex-wrap gap-2"><Button icon={ACTION_ICONS.call} label="Disposition anrufen" showLabel href={`tel:${person?.telefon.replace(/\s/g, "")}`} external variant="secondary" />{route.status === "GEPLANT" ? <Button icon={Undo2} label="Route abgeben" showLabel variant="secondary" disabled={routeAbgeben.isPending} onClick={() => setRouteAbgebenBestaetigen(true)} /> : null}{alleZugestellt && route.status !== "ABGESCHLOSSEN" ? <Button icon={CheckCircle2} label="Tour abschließen" showLabel loading={advanceRouteStatus.isPending} onClick={() => advanceRouteStatus.mutate({ route, ziel: "ABGESCHLOSSEN" }, { onError: () => toast.error("Tour konnte nicht abgeschlossen werden. Bitte erneut versuchen.") })} /> : null}</div></div></Card>

      <div className="flex flex-col gap-5">
        {route.stopps.map((stopp) => {
          const status = stopp.status;
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stopp.einrichtungAdresse)}`;
          return <Card key={stopp.id} className={status === "ZUGESTELLT" ? "border-ok/40" : status === "PROBLEM" ? "border-danger/40" : ""}>
            <div className={`flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4 ${status === "ZUGESTELLT" ? "bg-ok-soft" : status === "PROBLEM" ? "bg-danger-soft" : ""}`}><div className="flex min-w-0 gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-basil font-display font-semibold text-white">{stopp.reihenfolge}</span><div className="min-w-0"><h2 className="break-words font-display text-xl font-semibold text-ink">{stopp.einrichtungName}</h2><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} className="shrink-0" aria-hidden />{stopp.einrichtungAdresse}</p>{stopp.kontakt ? <p className="mt-0.5 break-words text-xs text-muted">Ansprechpartner: {stopp.kontakt}</p> : null}</div></div><div className="text-right"><p className="font-display text-xl font-semibold text-basil">{stopp.ankunft} Uhr</p>{stopp.zeitfenster && <p className="text-xs text-muted">Lieferfenster {stopp.zeitfenster}</p>}</div></div>
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px] [&>*]:min-w-0">
              <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Bei diesem Kunden ausladen</p><div className="divide-y divide-line rounded-lg border border-line">{stopp.positionen.map((position) => <div key={position.id} className="flex items-start justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="break-words font-semibold text-ink">{position.rezeptName}</p><p className="mt-1 text-xs text-muted">{position.behaelter}{position.hinweis ? ` · ${position.hinweis}` : ""}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-warn"><Thermometer size={13} className="shrink-0" aria-hidden />{position.temperatur}</p></div><p className="shrink-0 font-display text-xl font-semibold text-basil">{position.portionen}</p></div>)}</div>{stopp.hinweis ? <p className="mt-3 rounded-lg bg-saffron-soft px-3 py-2 text-sm font-medium text-warn">{stopp.hinweis}</p> : null}</div>
              <div className="flex flex-wrap content-start items-center gap-2 lg:flex-col lg:flex-nowrap lg:items-stretch"><Button icon={ACTION_ICONS.navigate} label="Navigation starten" showLabel href={mapsUrl} external className={AKTION_CLS} /><Button icon={ACTION_ICONS.call} label="Kontakt anrufen" showLabel href={`tel:${stopp.telefon.replace(/\s/g, "")}`} external variant="secondary" className={AKTION_CLS} />{status !== "ZUGESTELLT" ? <Button icon={ACTION_ICONS.confirm} label="Zugestellt" showLabel className={AKTION_CLS} loading={stoppWirdAktualisiert(stopp.id)} onClick={() => updateStoppStatus.mutate({ routeId: route.id, stoppId: stopp.id, status: "ZUGESTELLT" }, { onError: () => toast.error("Status konnte nicht aktualisiert werden. Bitte erneut versuchen.") })} /> : <div className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ok-soft px-4 py-2 text-sm font-semibold text-ok lg:justify-start"><CheckCircle2 size={17} className="shrink-0" aria-hidden /> Zugestellt</div>}{status !== "PROBLEM" && status !== "ZUGESTELLT" ? <Button icon={AlertTriangle} label="Problem melden" showLabel variant="danger" className={AKTION_CLS} disabled={stoppWirdAktualisiert(stopp.id)} onClick={() => setProblemStoppId(stopp.id)} /> : null}{status === "PROBLEM" ? <Button icon={ACTION_ICONS.reset} label="Problem geklärt" showLabel variant="secondary" className={AKTION_CLS} loading={stoppWirdAktualisiert(stopp.id)} onClick={() => updateStoppStatus.mutate({ routeId: route.id, stoppId: stopp.id, status: "OFFEN" }, { onError: () => toast.error("Status konnte nicht aktualisiert werden. Bitte erneut versuchen.") })} /> : null}{status === "OFFEN" && andereRoutenAmTag.length > 0 ? <Button icon={ACTION_ICONS.transfer} label="Übergeben" showLabel variant="secondary" className={AKTION_CLS} onClick={() => { setZielRouteId(""); setTransferStoppId(stopp.id); }} /> : null}</div>
            </div>
          </Card>;
        })}
      </div>

      <PromptDialog
        open={!!problemStoppId}
        title="Problem melden"
        label="Was ist passiert?"
        placeholder="z. B. Einrichtung nicht erreichbar"
        confirmLabel="Problem melden"
        confirmIcon={AlertTriangle}
        onCancel={() => setProblemStoppId(null)}
        onConfirm={(wert) => {
          if (!problemStoppId) return;
          updateStoppStatus.mutate(
            { routeId: route.id, stoppId: problemStoppId, status: "PROBLEM", problemHinweis: wert },
            {
              onSuccess: () => setProblemStoppId(null),
              onError: () => toast.error("Problem konnte nicht gemeldet werden. Bitte erneut versuchen."),
            }
          );
        }}
      />

      <ConfirmDialog
        open={routeAbgebenBestaetigen}
        title="Route abgeben"
        message="Die Route wird wieder in den Pool gelegt, jeder andere Fahrer kann sie übernehmen. Du bist danach nicht mehr für diese Tour eingeteilt."
        confirmLabel={routeAbgeben.isPending ? "Wird abgegeben …" : "Route abgeben"}
        confirmIcon={Undo2}
        tone="warn"
        onCancel={() => setRouteAbgebenBestaetigen(false)}
        onConfirm={() => {
          setRouteWirdAbgegeben(true);
          routeAbgeben.mutate(route.id, {
            // Nach dem Abgeben gehört die Route diesem Fahrer nicht mehr — ein GET auf sie würde
            // jetzt mit 403 fehlschlagen (siehe DeliveryRouteHandler.GetByIdAsync); die Detailabfrage
            // ist seit dem Setzen von routeWirdAbgegeben schon deaktiviert, zusätzlich wird sofort
            // weg von dieser Seite navigiert.
            onSuccess: () => { setRouteAbgebenBestaetigen(false); router.push("/driver/routes"); },
            onError: () => {
              setRouteWirdAbgegeben(false);
              toast.error("Route konnte nicht abgegeben werden. Bitte erneut versuchen.");
            },
          });
        }}
      />

      {transferStoppId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setTransferStoppId(null)} aria-hidden />
          <form
            role="dialog"
            aria-modal="true"
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (!zielRouteId) return;
              stoppUebertragen.mutate(
                { routeId: route.id, stoppId: transferStoppId, zielRouteId },
                {
                  onSuccess: () => setTransferStoppId(null),
                  onError: () => toast.error("Stopp konnte nicht übertragen werden. Bitte erneut versuchen."),
                }
              );
            }}
          >
            <div className="px-5 pt-5"><h2 className="font-display text-lg font-semibold text-ink">Stopp an anderen Fahrer übergeben</h2></div>
            <div className="flex flex-col gap-2 px-5 py-4 text-sm text-ink-soft">
              <p>Der Stopp wird sofort auf die gewählte Route übertragen — ohne Rückfrage beim Zielfahrer. Bitte vorher telefonisch absprechen.</p>
              <label className="text-xs font-medium text-muted">
                Zielroute
                <select
                  required
                  value={zielRouteId}
                  onChange={(event) => setZielRouteId(event.target.value)}
                  className="mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
                >
                  <option value="">Bitte wählen …</option>
                  {andereRoutenAmTag.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {fahrer.find((f) => f.id === r.fahrerId)?.name ?? r.fahrerName}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
              <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel type="button" variant="secondary" onClick={() => setTransferStoppId(null)} />
              <Button icon={ACTION_ICONS.transfer} label="Übertragen" showLabel type="submit" disabled={!zielRouteId} loading={stoppUebertragen.isPending} />
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { type FormEvent, useState } from "react";
import { AlertTriangle, CalendarDays, Clock3, List, MapPin, Truck, UserPlus, UserRound } from "lucide-react";
import { Button, Card, StatCard, StatusBadge, Pagination, ACTION_ICONS } from "@/components/ui";
import { ConfirmDialog, Modal } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useStandorte } from "@/lib/services/locations";
import {
  useFahrer, useLieferRouten, useCreateLieferRoute, useUpdateLieferRoute, useDeleteLieferRoute, useStoppHinzufuegen, portionenJeRoute, behaelterPositionenJeRoute,
  type LieferRoute,
} from "@/lib/services/logistics";
import { usePagination } from "@/lib/use-pagination";
import { RoutesWeekView } from "./routes-week-view";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

function RouteFormular({
  initial,
  onClose,
  onSaved,
}: {
  initial?: LieferRoute;
  onClose: () => void;
  onSaved: (skippedClosedFacilities: string[], arrivalOutsideWindowWarnings: string[]) => void;
}) {
  const einrichtungen = useEinrichtungen();
  const standorte = useStandorte();
  const fahrer = useFahrer();
  const createRoute = useCreateLieferRoute();
  const updateRoute = useUpdateLieferRoute();
  const [name, setName] = useState(initial?.name ?? "");
  const [datum, setDatum] = useState(initial?.datum ?? "2026-08-07");
  const [fahrerId, setFahrerId] = useState(initial?.fahrerId ?? "");
  const [start, setStart] = useState(initial?.start ?? "10:15");
  const [einrichtungIds, setEinrichtungIds] = useState<string[]>(initial?.stopps.map((s) => s.einrichtungId) ?? []);
  const mutation = initial ? updateRoute : createRoute;
  const toast = useToast();

  function toggleEinrichtung(id: string) {
    setEinrichtungIds((aktuell) => aktuell.includes(id) ? aktuell.filter((eintrag) => eintrag !== id) : [...aktuell, id]);
  }

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || einrichtungIds.length === 0) return;
    const input = { name: name.trim(), datum, fahrerId: fahrerId || undefined, standortId: initial?.standortId ?? standorte[0]?.id, start, einrichtungIds };
    const onSuccess = (ergebnis?: { skippedClosedFacilities: string[]; arrivalOutsideWindowWarnings: string[] }) => {
      onClose();
      onSaved(ergebnis?.skippedClosedFacilities ?? [], ergebnis?.arrivalOutsideWindowWarnings ?? []);
    };
    const onError = (error: unknown) => toast.error(error instanceof ApiError ? error.message : "Speichern fehlgeschlagen. Bitte erneut versuchen.");
    if (initial) updateRoute.mutate({ id: initial.id, input }, { onSuccess, onError });
    else createRoute.mutate(input, { onSuccess, onError });
  }

  return (
    <Modal open onClose={onClose} title={initial ? `${initial.name} bearbeiten` : "Neue Liefertour"} hint="Fahrer, Startzeit und Kunden in der gewünschten Reihenfolge zuordnen." widthClassName="max-w-3xl">
      <form onSubmit={speichern} className="grid gap-5 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Routenname<input value={name} onChange={(event) => setName(event.target.value)} placeholder="z. B. Route Innenstadt" required className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Fahrer<select value={fahrerId} onChange={(event) => setFahrerId(event.target.value)} className={fieldClass}><option value="">Noch nicht vergeben (Fahrer übernimmt selbst)</option>{fahrer.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.kennzeichen}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Datum<input type="date" value={datum} onChange={(event) => setDatum(event.target.value)} required className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Abfahrt<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required className={fieldClass} /></label>
        <fieldset className="md:col-span-2"><legend className="mb-2 text-xs font-medium text-muted">Kunden auswählen · Reihenfolge entspricht der Auswahl</legend><p className="mb-3 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">Die bestellten Speisen und Portionen des gewählten Tages werden automatisch als Ladepositionen übernommen.</p><div className="grid gap-2 sm:grid-cols-2">{einrichtungen.filter((einrichtung) => einrichtung.status === "AKTIV").map((einrichtung) => <label key={einrichtung.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${einrichtungIds.includes(einrichtung.id) ? "border-basil bg-basil-soft" : "border-line bg-surface"}`}><input type="checkbox" checked={einrichtungIds.includes(einrichtung.id)} onChange={() => toggleEinrichtung(einrichtung.id)} className="mt-0.5 size-4 accent-basil" /><span><strong className="block text-ink">{einrichtung.name}</strong><span className="text-xs text-muted">{einrichtung.anschrift}</span></span></label>)}</div></fieldset>
        <div className="flex gap-2 md:col-span-2"><Button icon={ACTION_ICONS.save} label="Route speichern" type="submit" disabled={!name.trim() || einrichtungIds.length === 0} loading={mutation.isPending} /><Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" onClick={onClose} /></div>
      </form>
    </Modal>
  );
}

/** Kurzfristiger Sonderauftrag/Zusatzkunde — Einrichtung auswählen, die noch nicht Teil der Route
 * ist; funktioniert auch bei bereits gestarteten Touren (nur ABGESCHLOSSEN sperrt, siehe Backend). */
function SonderauftragDialog({
  route,
  einrichtungen,
  onClose,
  onHinzufuegen,
  wirdGespeichert,
}: {
  route: LieferRoute;
  einrichtungen: ReturnType<typeof useEinrichtungen>;
  onClose: () => void;
  onHinzufuegen: (einrichtungId: string) => void;
  wirdGespeichert: boolean;
}) {
  const [einrichtungId, setEinrichtungId] = useState("");
  const bereitsAufRoute = new Set(route.stopps.map((s) => s.einrichtungId));
  const auswahl = einrichtungen.filter((e) => e.status === "AKTIV" && !bereitsAufRoute.has(e.id));

  return (
    <Modal open onClose={onClose} title="Sonderauftrag hinzufügen" hint={`Neuer Stopp für „${route.name}“ — bestehende verbindliche Bestellungen der Einrichtung für diesen Tag werden automatisch übernommen.`}>
      <form
        onSubmit={(event) => { event.preventDefault(); if (einrichtungId) onHinzufuegen(einrichtungId); }}
        className="flex flex-col gap-4 p-5"
      >
        <label className="text-xs font-medium text-muted">
          Einrichtung
          <select
            required
            value={einrichtungId}
            onChange={(event) => setEinrichtungId(event.target.value)}
            className="mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
          >
            <option value="">Bitte wählen …</option>
            {auswahl.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button icon={ACTION_ICONS.cancel} label="Abbrechen" type="button" variant="secondary" onClick={onClose} />
          <Button icon={ACTION_ICONS.create} label="Hinzufügen" type="submit" disabled={!einrichtungId} loading={wirdGespeichert} />
        </div>
      </form>
    </Modal>
  );
}

export function RouteManager() {
  const toast = useToast();
  const routen = useLieferRouten();
  const einrichtungen = useEinrichtungen();
  const fahrer = useFahrer();
  const [ansicht, setAnsicht] = useState<"liste" | "woche">("liste");
  const [formularOffen, setFormularOffen] = useState(false);
  const [bearbeiteRoute, setBearbeiteRoute] = useState<LieferRoute | null>(null);
  const [sonderauftragRoute, setSonderauftragRoute] = useState<LieferRoute | null>(null);
  const [loescheRoute, setLoescheRoute] = useState<LieferRoute | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [uebersprungeneEinrichtungen, setUebersprungeneEinrichtungen] = useState<string[]>([]);
  const [zeitfensterWarnungen, setZeitfensterWarnungen] = useState<string[]>([]);
  const stoppHinzufuegen = useStoppHinzufuegen();
  const deleteRoute = useDeleteLieferRoute();
  const portionen = routen.reduce((summe, route) => summe + portionenJeRoute(route), 0);
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(routen);

  function formularGespeichert(skipped: string[], warnungen: string[]) {
    setUebersprungeneEinrichtungen(skipped);
    setZeitfensterWarnungen(warnungen);
  }

  function loeschenBestaetigt() {
    if (!loescheRoute) return;
    deleteRoute.mutate(loescheRoute.id, {
      onSuccess: () => toast.success(`„${loescheRoute.name}“ wurde gelöscht.`),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : "Löschen fehlgeschlagen. Bitte erneut versuchen."),
    });
    setLoescheRoute(null);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Routen geplant" value={String(routen.length)} hint="Für den gewählten Produktionstag" />
        <StatCard label="Kundenstopps" value={String(routen.reduce((summe, route) => summe + route.stopps.length, 0))} />
        <StatCard label="Auszuliefernde Portionen" value={String(portionen)} tone="ok" />
      </div>

      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          <Button icon={List} label="Liste" variant="ghost" size="sm" pressed={ansicht === "liste"} onClick={() => setAnsicht("liste")} />
          <Button icon={CalendarDays} label="Woche" variant="ghost" size="sm" pressed={ansicht === "woche"} onClick={() => setAnsicht("woche")} />
        </div>
        <Button icon={ACTION_ICONS.create} label="Neue Route definieren" onClick={() => setFormularOffen(true)} />
      </div>

      {uebersprungeneEinrichtungen.length > 0 ? (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
          Route gespeichert. Nicht aufgenommen, da an diesem Datum geschlossen: {uebersprungeneEinrichtungen.join(", ")}.
          <Button icon={ACTION_ICONS.hide} label="Ausblenden" variant="ghost" size="sm" onClick={() => setUebersprungeneEinrichtungen([])} className="ml-auto" />
        </p>
      ) : null}
      {zeitfensterWarnungen.length > 0 ? (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
          Geplante Ankunft außerhalb des Lieferfensters: {zeitfensterWarnungen.join("; ")}.
          <Button icon={ACTION_ICONS.hide} label="Ausblenden" variant="ghost" size="sm" onClick={() => setZeitfensterWarnungen([])} className="ml-auto" />
        </p>
      ) : null}

      {formularOffen ? <RouteFormular onClose={() => setFormularOffen(false)} onSaved={formularGespeichert} /> : null}
      {bearbeiteRoute ? <RouteFormular initial={bearbeiteRoute} onClose={() => setBearbeiteRoute(null)} onSaved={formularGespeichert} /> : null}

      {ansicht === "woche" ? <RoutesWeekView onEditRoute={setBearbeiteRoute} /> : (
      <>
      <div className="flex flex-col gap-5">
        {pageItems.map((route) => {
          const istOffen = details === route.id;
          const person = fahrer.find((f) => f.id === route.fahrerId);
          const zugestellt = route.stopps.filter((s) => s.status === "ZUGESTELLT").length;
          const probleme = route.stopps.filter((s) => s.status === "PROBLEM").length;
          return <Card key={route.id}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div><div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={route.status} />
                <span className="text-xs text-muted">{new Date(`${route.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}</span>
                {route.status !== "GEPLANT" && <span className="text-xs font-medium text-muted">{zugestellt}/{route.stopps.length} zugestellt</span>}
                {probleme > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger"><AlertTriangle size={12} aria-hidden />{probleme} {probleme === 1 ? "Problem" : "Probleme"}</span>}
              </div><h2 className="mt-2 font-display text-xl font-semibold text-ink">{route.name}</h2><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="inline-flex items-center gap-1.5"><UserRound size={15} aria-hidden />{route.fahrerName ?? "Nicht vergeben"}</span><span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden />{person?.fahrzeug} · {person?.kennzeichen}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden />{route.start}{route.rueckkehr ? `–${route.rueckkehr}` : ""} Uhr</span></div></div>
              <div className="flex items-center gap-5"><div className="text-right"><p className="font-display text-2xl font-semibold text-basil">{portionenJeRoute(route)}</p><p className="text-xs text-muted">Portionen · {route.stopps.length} Stopps</p></div><div className="flex items-center gap-2">{route.status === "GEPLANT" ? <Button icon={ACTION_ICONS.edit} label="Bearbeiten" variant="secondary" onClick={() => setBearbeiteRoute(route)} /> : null}{route.status !== "ABGESCHLOSSEN" ? <Button icon={UserPlus} label="Sonderauftrag" variant="secondary" onClick={() => setSonderauftragRoute(route)} /> : null}<Button icon={ACTION_ICONS.delete} label="Löschen" variant="danger" onClick={() => setLoescheRoute(route)} /><Button icon={istOffen ? ACTION_ICONS.hide : ACTION_ICONS.view} label={istOffen ? "Schließen" : "Tour anzeigen"} variant="secondary" pressed={istOffen} onClick={() => setDetails(istOffen ? null : route.id)} /></div></div>
            </div>
            {istOffen ? <div className="border-t border-line bg-paper/50 px-5 py-5"><div className="relative ml-3 border-l-2 border-basil-soft pl-6">{route.stopps.map((stopp) => {
              const einrichtung = einrichtungen.find((e) => e.id === stopp.einrichtungId);
              const punktFarbe = stopp.status === "ZUGESTELLT" ? "bg-ok" : stopp.status === "PROBLEM" ? "bg-danger" : "bg-basil";
              return <div key={stopp.id} className="relative pb-6 last:pb-0"><span className={`absolute -left-[33px] flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${punktFarbe}`}>{stopp.reihenfolge}</span><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{stopp.einrichtungName}</p><StatusBadge status={stopp.status} /></div><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted"><MapPin size={13} aria-hidden />{einrichtung?.anschrift}</p><p className="mt-1 text-xs text-muted">Ankunft {stopp.ankunft}{stopp.zeitfenster ? ` · Zeitfenster ${stopp.zeitfenster}` : ""}{stopp.zugestelltAm ? ` · Zugestellt um ${stopp.zugestelltAm}` : ""}</p>{stopp.status === "PROBLEM" && stopp.problemHinweis ? <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger"><AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden />{stopp.problemHinweis}</p> : null}</div><div className="text-right">{stopp.positionen.map((position) => <p key={position.id} className="text-sm"><strong className="text-basil">{position.portionen}</strong> {position.rezeptName} · {position.behaelter}</p>)}</div></div></div>;
            })}</div><p className="mt-5 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-muted"><CalendarDays size={14} aria-hidden />{behaelterPositionenJeRoute(route)} Ladepositionen werden automatisch an den Fahrer übergeben.</p></div> : null}
          </Card>;
        })}
      </div>
      <Card className="mt-5">
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
      </>
      )}

      {sonderauftragRoute ? (
        <SonderauftragDialog
          route={sonderauftragRoute}
          einrichtungen={einrichtungen}
          onClose={() => setSonderauftragRoute(null)}
          onHinzufuegen={(einrichtungId) => {
            stoppHinzufuegen.mutate(
              { routeId: sonderauftragRoute.id, einrichtungId },
              {
                onSuccess: () => { toast.success("Stopp wurde hinzugefügt."); setSonderauftragRoute(null); },
                onError: (error) => toast.error(error instanceof ApiError ? error.message : "Stopp konnte nicht hinzugefügt werden."),
              }
            );
          }}
          wirdGespeichert={stoppHinzufuegen.isPending}
        />
      ) : null}

      <ConfirmDialog
        open={!!loescheRoute}
        title="Route löschen"
        tone="warn"
        message={<><strong>{loescheRoute?.name}</strong> wird unwiderruflich gelöscht — inklusive aller Stopps und Ladepositionen, unabhängig vom Status der Tour.</>}
        confirmLabel="Endgültig löschen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoescheRoute(null)}
        onConfirm={loeschenBestaetigt}
      />
    </>
  );
}

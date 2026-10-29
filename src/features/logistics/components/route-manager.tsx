"use client";

import { type FormEvent, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CalendarDays, Clock3, List, MapPin, Truck, UserPlus, UserRound } from "lucide-react";
import { Button, Card, StatCard, StatusBadge, Pagination, ACTION_ICONS } from "@/components/ui";
import { ConfirmDialog, Modal } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useStandorte } from "@/lib/services/locations";
import {
  useFahrer, useLieferRoute, useLieferRouten, useCreateLieferRoute, useUpdateLieferRoute, useDeleteLieferRoute, useStoppHinzufuegen, useRouteKopieren,
  portionenJeRoute, behaelterPositionenJeRoute, kopierErgebnisText,
  type LieferRoute,
  fahrzeugLabel,
} from "@/lib/services/logistics";
import { usePagination } from "@/lib/use-pagination";
import { RoutesWeekView } from "./routes-week-view";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";
const WOCHENTAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit (toISOString wäre UTC und kippt nachts auf den Vortag). */
const heuteIso = () => new Date().toLocaleDateString("sv-SE");
const fehlerText = (error: unknown, fallback: string) => error instanceof ApiError ? error.message : fallback;

function RouteFormular({
  initial,
  vorgabeDatum,
  onClose,
  onSaved,
}: {
  initial?: LieferRoute;
  /** Datum für eine neue Tour, z. B. aus der Wochenansicht ("+" an einem Tag). */
  vorgabeDatum?: string;
  onClose: () => void;
  onSaved: (skippedClosedFacilities: string[], arrivalOutsideWindowWarnings: string[]) => void;
}) {
  const einrichtungen = useEinrichtungen();
  const standorte = useStandorte();
  const fahrer = useFahrer();
  const createRoute = useCreateLieferRoute();
  const updateRoute = useUpdateLieferRoute();
  const [name, setName] = useState(initial?.name ?? "");
  const [datum, setDatum] = useState(initial?.datum ?? vorgabeDatum ?? heuteIso());
  const [fahrerId, setFahrerId] = useState(initial?.fahrerId ?? "");
  const [start, setStart] = useState(initial?.start ?? "10:15");
  const [einrichtungIds, setEinrichtungIds] = useState<string[]>(initial?.stopps.map((s) => s.einrichtungId) ?? []);
  const mutation = initial ? updateRoute : createRoute;
  const toast = useToast();

  // Eine Kita wird pro Tag nur von einer Tour beliefert — Einrichtungen, die am gewählten Datum
  // schon auf einer anderen Tour stehen, sind hier gesperrt (Backend prüft dasselbe).
  const routenAmTag = useLieferRouten({ datum });
  const vergebenAn = useMemo(() => {
    const map = new Map<string, string>();
    for (const route of routenAmTag) {
      if (route.id === initial?.id) continue;
      for (const stopp of route.stopps) map.set(stopp.einrichtungId, route.name);
    }
    return map;
  }, [routenAmTag, initial?.id]);
  const konflikte = einrichtungIds.filter((id) => vergebenAn.has(id));
  const aktive = einrichtungen.filter((e) => e.status === "AKTIV");
  const nameVon = (id: string) => einrichtungen.find((e) => e.id === id)?.name ?? "…";

  function toggleEinrichtung(id: string) {
    setEinrichtungIds((aktuell) => aktuell.includes(id) ? aktuell.filter((eintrag) => eintrag !== id) : [...aktuell, id]);
  }

  function verschieben(index: number, richtung: -1 | 1) {
    setEinrichtungIds((aktuell) => {
      const ziel = index + richtung;
      if (ziel < 0 || ziel >= aktuell.length) return aktuell;
      const neu = [...aktuell];
      [neu[index], neu[ziel]] = [neu[ziel], neu[index]];
      return neu;
    });
  }

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || einrichtungIds.length === 0 || konflikte.length > 0) return;
    const input = { name: name.trim(), datum, fahrerId: fahrerId || undefined, standortId: initial?.standortId ?? standorte[0]?.id, start, einrichtungIds };
    const onSuccess = (ergebnis?: { skippedClosedFacilities: string[]; arrivalOutsideWindowWarnings: string[] }) => {
      onClose();
      onSaved(ergebnis?.skippedClosedFacilities ?? [], ergebnis?.arrivalOutsideWindowWarnings ?? []);
    };
    const onError = (error: unknown) => toast.error(fehlerText(error, "Speichern fehlgeschlagen. Bitte erneut versuchen."));
    if (initial) updateRoute.mutate({ id: initial.id, input }, { onSuccess, onError });
    else createRoute.mutate(input, { onSuccess, onError });
  }

  return (
    <Modal open onClose={onClose} title={initial ? `${initial.name} bearbeiten` : "Neue Liefertour"} hint="Fahrer, Startzeit und Kunden zuordnen — die Reihenfolge bestimmt die Anfahrt." widthClassName="max-w-3xl">
      <form onSubmit={speichern} className="grid gap-5 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Routenname<input value={name} onChange={(event) => setName(event.target.value)} placeholder="z. B. Tour 1 (Dorsten)" required className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Fahrer<select value={fahrerId} onChange={(event) => setFahrerId(event.target.value)} className={fieldClass}><option value="">Noch nicht vergeben (Fahrer übernimmt selbst)</option>{fahrer.map((person) => <option key={person.id} value={person.id}>{person.kennzeichen ? `${person.name} · ${person.kennzeichen}` : person.name}</option>)}</select></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Datum<input type="date" value={datum} onChange={(event) => setDatum(event.target.value)} required className={fieldClass} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">Abfahrt<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required className={fieldClass} /></label>

        <section className="md:col-span-2">
          <h3 className="mb-2 text-xs font-medium text-muted">Reihenfolge der Anfahrt ({einrichtungIds.length})</h3>
          {einrichtungIds.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-3 text-xs text-muted">Noch keine Kunden ausgewählt — unten anklicken, dann hier mit den Pfeilen priorisieren.</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {einrichtungIds.map((id, index) => {
                const konflikt = vergebenAn.get(id);
                return (
                  <li key={id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${konflikt ? "border-danger/40 bg-danger-soft" : "border-line bg-paper"}`}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-basil text-xs font-bold text-white">{index + 1}</span>
                    <span className="min-w-0 flex-1 break-words">
                      <strong className="text-ink">{nameVon(id)}</strong>
                      {konflikt ? <span className="block text-xs text-danger">Bereits in „{konflikt}“ an diesem Tag</span> : null}
                    </span>
                    <Button icon={ArrowUp} label="Nach oben" variant="ghost" size="sm" disabled={index === 0} onClick={() => verschieben(index, -1)} />
                    <Button icon={ArrowDown} label="Nach unten" variant="ghost" size="sm" disabled={index === einrichtungIds.length - 1} onClick={() => verschieben(index, 1)} />
                    <Button icon={ACTION_ICONS.cancel} label="Entfernen" variant="ghost" size="sm" onClick={() => toggleEinrichtung(id)} />
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-xs font-medium text-muted">Kunden auswählen</legend>
          <p className="mb-3 rounded-lg bg-info-soft px-3 py-2 text-xs text-info">Die bestellten Speisen und Portionen des gewählten Tages werden automatisch als Ladepositionen übernommen. Jede Einrichtung kann pro Tag nur auf einer Tour sein.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {aktive.map((einrichtung) => {
              const gewaehlt = einrichtungIds.includes(einrichtung.id);
              const andereTour = vergebenAn.get(einrichtung.id);
              const gesperrt = !!andereTour && !gewaehlt;
              return (
                <label key={einrichtung.id} className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${gesperrt ? "cursor-not-allowed border-line bg-paper opacity-60" : "cursor-pointer"} ${gewaehlt ? "border-basil bg-basil-soft" : "border-line bg-surface"}`}>
                  <input type="checkbox" checked={gewaehlt} disabled={gesperrt} onChange={() => toggleEinrichtung(einrichtung.id)} className="mt-0.5 size-4 shrink-0 accent-basil" />
                  <span className="min-w-0 break-words">
                    <strong className="block text-ink">{gewaehlt ? `${einrichtungIds.indexOf(einrichtung.id) + 1}. ` : ""}{einrichtung.name}</strong>
                    <span className="text-xs text-muted">{andereTour ? `Bereits in „${andereTour}“` : einrichtung.anschrift}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4 md:col-span-2">
          <Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" showLabel onClick={onClose} />
          <Button icon={ACTION_ICONS.save} label="Route speichern" type="submit" showLabel disabled={!name.trim() || einrichtungIds.length === 0 || konflikte.length > 0} loading={mutation.isPending} />
        </div>
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
  const routenAmTag = useLieferRouten({ datum: route.datum });
  const belegt = new Set(routenAmTag.flatMap((r) => r.stopps.map((s) => s.einrichtungId)));
  route.stopps.forEach((s) => belegt.add(s.einrichtungId));
  const auswahl = einrichtungen.filter((e) => e.status === "AKTIV" && !belegt.has(e.id));

  return (
    <Modal open onClose={onClose} title="Sonderauftrag hinzufügen" hint={`Neuer Stopp für „${route.name}“ — bestehende verbindliche Bestellungen der Einrichtung für diesen Tag werden automatisch übernommen.`}>
      <form
        onSubmit={(event) => { event.preventDefault(); if (einrichtungId) onHinzufuegen(einrichtungId); }}
        className="flex flex-col gap-4 p-5"
      >
        <label className="text-xs font-medium text-muted">
          Einrichtung (nur solche, die an diesem Tag noch auf keiner Tour sind)
          <select required value={einrichtungId} onChange={(event) => setEinrichtungId(event.target.value)} className={`mt-1.5 ${fieldClass}`}>
            <option value="">Bitte wählen …</option>
            {auswahl.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button icon={ACTION_ICONS.cancel} label="Abbrechen" type="button" variant="secondary" showLabel onClick={onClose} />
          <Button icon={ACTION_ICONS.create} label="Hinzufügen" type="submit" showLabel disabled={!einrichtungId} loading={wirdGespeichert} />
        </div>
      </form>
    </Modal>
  );
}

/** Wochenplanung: Tour mit gleicher Kundenreihenfolge auf weitere Tage übertragen (diese und
 * nächste Woche zur Auswahl). Kunden, die am Zieltag schon auf einer anderen Tour sind, lässt das
 * Backend aus und meldet sie zurück. */
function RouteKopierenDialog({ route, onClose }: { route: LieferRoute; onClose: () => void }) {
  const toast = useToast();
  const kopieren = useRouteKopieren();
  const [auswahl, setAuswahl] = useState<string[]>([]);
  const tage = useMemo(() => {
    const d = new Date(`${route.datum}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return Array.from({ length: 14 }, (_, i) => {
      const tag = new Date(d);
      tag.setUTCDate(d.getUTCDate() + i);
      return tag.toISOString().slice(0, 10);
    });
  }, [route.datum]);

  const umschalten = (iso: string) => setAuswahl((a) => a.includes(iso) ? a.filter((x) => x !== iso) : [...a, iso]);
  const werktageDieseWoche = tage.slice(0, 5).filter((t) => t !== route.datum);

  function absenden(event: FormEvent) {
    event.preventDefault();
    kopieren.mutate({ routeId: route.id, daten: auswahl }, {
      onSuccess: (ergebnis) => { toast.success(kopierErgebnisText(ergebnis)); onClose(); },
      onError: (error) => toast.error(fehlerText(error, "Kopieren fehlgeschlagen. Bitte erneut versuchen.")),
    });
  }

  return (
    <Modal open onClose={onClose} title={`${route.name} auf andere Tage kopieren`} hint="Gleicher Fahrer, gleiche Abfahrt und gleiche Reihenfolge der Kunden. Stopps werden mit den Bestellungen des jeweiligen Tages neu aufgebaut.">
      <form onSubmit={absenden} className="flex flex-col gap-4 p-5">
        {[0, 1].map((woche) => (
          <fieldset key={woche}>
            <legend className="mb-2 text-xs font-medium text-muted">{woche === 0 ? "Diese Woche" : "Nächste Woche"}</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {tage.slice(woche * 7, woche * 7 + 7).map((iso, i) => {
                const istQuelle = iso === route.datum;
                const gewaehlt = auswahl.includes(iso);
                return (
                  <label key={iso} className={`flex flex-col items-center rounded-lg border px-2 py-2 text-xs ${istQuelle ? "cursor-not-allowed border-basil bg-basil-soft opacity-70" : gewaehlt ? "cursor-pointer border-basil bg-basil-soft" : "cursor-pointer border-line bg-surface"}`}>
                    <input type="checkbox" className="sr-only" disabled={istQuelle} checked={gewaehlt} onChange={() => umschalten(iso)} />
                    <strong className="text-ink">{WOCHENTAGE_KURZ[i]}</strong>
                    <span className="text-muted">{iso.slice(8, 10)}.{iso.slice(5, 7)}.</span>
                    {istQuelle ? <span className="mt-0.5 text-[10px] text-basil">Quelle</span> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <Button icon={CalendarDays} label="Restliche Werktage dieser Woche" variant="ghost" showLabel onClick={() => setAuswahl(werktageDieseWoche)} />
          <div className="flex gap-2">
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" showLabel onClick={onClose} />
            <Button icon={ACTION_ICONS.copy} label={`Auf ${auswahl.length} Tag(e) kopieren`} type="submit" showLabel disabled={auswahl.length === 0} loading={kopieren.isPending} />
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** Detailansicht einer Tour (Stopps in Anfahrtsreihenfolge, Ladepositionen) als Modal — vorher
 * klappte das unterhalb der Karte auf. Lädt die Route per Id, damit sie nach Sonderauftrag o. Ä.
 * aktuell bleibt. */
function RouteDetailModal({
  routeId,
  onClose,
  onBearbeiten,
  onKopieren,
  onSonderauftrag,
  onLoeschen,
}: {
  routeId: string;
  onClose: () => void;
  onBearbeiten: (route: LieferRoute) => void;
  onKopieren: (route: LieferRoute) => void;
  onSonderauftrag: (route: LieferRoute) => void;
  onLoeschen: (route: LieferRoute) => void;
}) {
  const route = useLieferRoute(routeId);
  const fahrer = useFahrer();
  if (!route) return <Modal open onClose={onClose} title="Tour wird geladen …"><p className="p-5 text-sm text-muted">Bitte einen Moment …</p></Modal>;
  const person = fahrer.find((f) => f.id === route.fahrerId);

  return (
    <Modal open onClose={onClose} title={route.name} hint={`${new Date(`${route.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })} · Abfahrt ${route.start} Uhr`} widthClassName="max-w-3xl">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-5 py-3 text-sm text-muted">
        <StatusBadge status={route.status} />
        <span className="inline-flex items-center gap-1.5"><UserRound size={15} aria-hidden />{route.fahrerName ?? "Nicht vergeben"}</span>
        <span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden />{fahrzeugLabel(person)}</span>
        <span className="font-medium text-basil">{portionenJeRoute(route)} Portionen · {route.stopps.length} Stopps</span>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
        {route.status === "GEPLANT" ? <Button icon={ACTION_ICONS.edit} label="Bearbeiten" variant="secondary" showLabel onClick={() => onBearbeiten(route)} /> : null}
        <Button icon={ACTION_ICONS.copy} label="Auf Tage kopieren" variant="secondary" showLabel onClick={() => onKopieren(route)} />
        {route.status !== "ABGESCHLOSSEN" ? <Button icon={UserPlus} label="Sonderauftrag" variant="secondary" showLabel onClick={() => onSonderauftrag(route)} /> : null}
        <Button icon={ACTION_ICONS.delete} label="Löschen" variant="danger" showLabel onClick={() => onLoeschen(route)} />
      </div>
      <div className="px-5 py-5">
        {route.stopps.length === 0 ? <p className="text-sm text-muted">Keine Stopps auf dieser Tour.</p> : (
          <div className="relative ml-3 border-l-2 border-basil-soft pl-6">{route.stopps.map((stopp) => {
            const punktFarbe = stopp.status === "ZUGESTELLT" ? "bg-ok" : stopp.status === "PROBLEM" ? "bg-danger" : "bg-basil";
            return <div key={stopp.id} className="relative pb-6 last:pb-0"><span className={`absolute -left-[33px] flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${punktFarbe}`}>{stopp.reihenfolge}</span><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="min-w-0 break-words font-semibold text-ink">{stopp.einrichtungName}</p><StatusBadge status={stopp.status} /></div><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted"><MapPin size={13} className="shrink-0" aria-hidden />{stopp.einrichtungAdresse}</p><p className="mt-1 text-xs text-muted">Ankunft {stopp.ankunft}{stopp.zeitfenster ? ` · Zeitfenster ${stopp.zeitfenster}` : ""}{stopp.zugestelltAm ? ` · Zugestellt um ${stopp.zugestelltAm}` : ""}</p>{stopp.status === "PROBLEM" && stopp.problemHinweis ? <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger"><AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden />{stopp.problemHinweis}</p> : null}</div><div className="text-right">{stopp.positionen.map((position) => <p key={position.id} className="text-sm"><strong className="text-basil">{position.portionen}</strong> {position.rezeptName} · {position.behaelter}</p>)}</div></div></div>;
          })}</div>
        )}
        <p className="mt-5 flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-xs text-muted"><CalendarDays size={14} className="shrink-0" aria-hidden />{behaelterPositionenJeRoute(route)} Ladepositionen werden automatisch an den Fahrer übergeben.</p>
      </div>
    </Modal>
  );
}

export function RouteManager() {
  const toast = useToast();
  const routen = useLieferRouten();
  const einrichtungen = useEinrichtungen();
  const fahrer = useFahrer();
  const [ansicht, setAnsicht] = useState<"liste" | "woche">("liste");
  /** undefined = zu, string = neue Tour (mit Vorgabedatum, "" für heute). */
  const [neueTourDatum, setNeueTourDatum] = useState<string | undefined>(undefined);
  const [bearbeiteRoute, setBearbeiteRoute] = useState<LieferRoute | null>(null);
  const [detailRouteId, setDetailRouteId] = useState<string | null>(null);
  const [kopiereRoute, setKopiereRoute] = useState<LieferRoute | null>(null);
  const [sonderauftragRoute, setSonderauftragRoute] = useState<LieferRoute | null>(null);
  const [loescheRoute, setLoescheRoute] = useState<LieferRoute | null>(null);
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
      onError: (error) => toast.error(fehlerText(error, "Löschen fehlgeschlagen. Bitte erneut versuchen.")),
    });
    if (detailRouteId === loescheRoute.id) setDetailRouteId(null);
    setLoescheRoute(null);
  }

  // Aus der Detailansicht heraus: Detail-Modal schließen und das Folge-Modal öffnen, damit nie zwei
  // Overlays übereinanderliegen.
  const ausDetail = (aktion: (route: LieferRoute) => void) => (route: LieferRoute) => { setDetailRouteId(null); aktion(route); };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Routen geplant" value={String(routen.length)} hint="Alle geladenen Touren" />
        <StatCard label="Kundenstopps" value={String(routen.reduce((summe, route) => summe + route.stopps.length, 0))} />
        <StatCard label="Auszuliefernde Portionen" value={String(portionen)} tone="ok" />
      </div>

      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          <Button icon={List} label="Liste" variant="ghost" size="sm" showLabel pressed={ansicht === "liste"} onClick={() => setAnsicht("liste")} />
          <Button icon={CalendarDays} label="Wochenplan" variant="ghost" size="sm" showLabel pressed={ansicht === "woche"} onClick={() => setAnsicht("woche")} />
        </div>
        <Button icon={ACTION_ICONS.create} label="Neue Route definieren" showLabel onClick={() => setNeueTourDatum("")} />
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

      {neueTourDatum !== undefined ? <RouteFormular vorgabeDatum={neueTourDatum || undefined} onClose={() => setNeueTourDatum(undefined)} onSaved={formularGespeichert} /> : null}
      {bearbeiteRoute ? <RouteFormular initial={bearbeiteRoute} onClose={() => setBearbeiteRoute(null)} onSaved={formularGespeichert} /> : null}
      {kopiereRoute ? <RouteKopierenDialog route={kopiereRoute} onClose={() => setKopiereRoute(null)} /> : null}
      {detailRouteId ? (
        <RouteDetailModal
          routeId={detailRouteId}
          onClose={() => setDetailRouteId(null)}
          onBearbeiten={ausDetail(setBearbeiteRoute)}
          onKopieren={ausDetail(setKopiereRoute)}
          onSonderauftrag={ausDetail(setSonderauftragRoute)}
          onLoeschen={ausDetail(setLoescheRoute)}
        />
      ) : null}

      {ansicht === "woche" ? <RoutesWeekView onOpenRoute={(route) => setDetailRouteId(route.id)} onNeueTour={setNeueTourDatum} /> : (
      <>
      <div className="flex flex-col gap-5">
        {routen.length === 0 ? <Card><p className="px-5 py-8 text-center text-sm text-muted">Noch keine Touren angelegt.</p></Card> : null}
        {pageItems.map((route) => {
          const person = fahrer.find((f) => f.id === route.fahrerId);
          const zugestellt = route.stopps.filter((s) => s.status === "ZUGESTELLT").length;
          const probleme = route.stopps.filter((s) => s.status === "PROBLEM").length;
          return <Card key={route.id}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={route.status} />
                <span className="text-xs text-muted">{new Date(`${route.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}</span>
                {route.status !== "GEPLANT" && <span className="text-xs font-medium text-muted">{zugestellt}/{route.stopps.length} zugestellt</span>}
                {probleme > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger"><AlertTriangle size={12} aria-hidden />{probleme} {probleme === 1 ? "Problem" : "Probleme"}</span>}
              </div><h2 className="mt-2 break-words font-display text-xl font-semibold text-ink">{route.name}</h2><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="inline-flex items-center gap-1.5"><UserRound size={15} aria-hidden />{route.fahrerName ?? "Nicht vergeben"}</span><span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden />{fahrzeugLabel(person)}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden />{route.start}{route.rueckkehr ? `–${route.rueckkehr}` : ""} Uhr</span></div>
              {route.stopps.length > 0 ? <p className="mt-2 break-words text-xs text-muted">{route.stopps.map((s) => `${s.reihenfolge}. ${s.einrichtungName}`).join("  ·  ")}</p> : null}</div>
              <div className="flex flex-wrap items-center gap-5"><div className="text-right"><p className="font-display text-2xl font-semibold text-basil">{portionenJeRoute(route)}</p><p className="text-xs text-muted">Portionen · {route.stopps.length} Stopps</p></div><div className="flex flex-wrap items-center gap-2">
                <Button icon={ACTION_ICONS.view} label="Tour anzeigen" variant="secondary" showLabel onClick={() => setDetailRouteId(route.id)} />
                {route.status === "GEPLANT" ? <Button icon={ACTION_ICONS.edit} label="Bearbeiten" variant="secondary" showLabel onClick={() => setBearbeiteRoute(route)} /> : null}
                <Button icon={ACTION_ICONS.copy} label="Kopieren" variant="secondary" showLabel onClick={() => setKopiereRoute(route)} />
                {route.status !== "ABGESCHLOSSEN" ? <Button icon={UserPlus} label="Sonderauftrag" variant="secondary" showLabel onClick={() => setSonderauftragRoute(route)} /> : null}
                <Button icon={ACTION_ICONS.delete} label="Löschen" variant="danger" showLabel onClick={() => setLoescheRoute(route)} />
              </div></div>
            </div>
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
                onError: (error) => toast.error(fehlerText(error, "Stopp konnte nicht hinzugefügt werden.")),
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

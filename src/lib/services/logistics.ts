import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export type RouteStatus = "GEPLANT" | "BELADUNG" | "UNTERWEGS" | "ABGESCHLOSSEN";
export type StoppStatus = "OFFEN" | "ZUGESTELLT" | "PROBLEM";
const ROUTE_STATUS_ORDER: RouteStatus[] = ["GEPLANT", "BELADUNG", "UNTERWEGS", "ABGESCHLOSSEN"];

export interface Fahrer {
  id: string;
  userId: string;
  name: string;
  telefon: string;
  fahrzeug: string;
  kennzeichen: string;
}

export interface LieferPosition {
  id: string;
  rezeptId: string;
  rezeptName: string;
  portionen: number;
  behaelter: string;
  temperatur: string;
  hinweis?: string;
  verpackt: boolean;
  geladen: boolean;
}

export interface RoutenStopp {
  id: string;
  einrichtungId: string;
  einrichtungName: string;
  einrichtungAdresse: string;
  reihenfolge: number;
  ankunft: string;
  zeitfenster?: string;
  kontakt: string;
  telefon: string;
  hinweis?: string;
  status: StoppStatus;
  problemHinweis?: string;
  zugestelltAm?: string;
  positionen: LieferPosition[];
}

export interface LieferRoute {
  id: string;
  name: string;
  datum: string;
  /** Undefined solange kein Fahrer die Route übernommen hat — siehe useRouteUebernehmen. */
  fahrerId?: string;
  fahrerName?: string;
  standortId?: string;
  start: string;
  rueckkehr?: string;
  kilometer?: number;
  status: RouteStatus;
  handoffWarmBestaetigt: boolean;
  handoffKaltBestaetigt: boolean;
  handoffDessertBestaetigt: boolean;
  handoffBestaetigtAm?: string;
  stopps: RoutenStopp[];
}

interface DriverDto {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  vehicleDescription: string;
  licensePlate: string;
}

interface RouteStopItemDto {
  id: string;
  recipeId: string;
  recipeName: string;
  portions: number;
  containerDescription: string;
  temperatureRequirement: string;
  note: string | null;
  isPacked: boolean;
  isLoaded: boolean;
}

interface RouteStopDto {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  sequenceNumber: number;
  plannedArrivalTime: string;
  deliveryWindowStart: string | null;
  deliveryWindowEnd: string | null;
  contactName: string;
  contactPhone: string;
  note: string | null;
  status: string;
  problemNote: string | null;
  deliveredAt: string | null;
  items: RouteStopItemDto[];
}

interface DeliveryRouteDto {
  id: string;
  name: string;
  date: string;
  driverId: string | null;
  driverName: string | null;
  locationId: string | null;
  locationName: string | null;
  plannedDepartureTime: string;
  plannedReturnTime: string | null;
  distanceKm: number | null;
  status: string;
  handoffWarmConfirmed: boolean;
  handoffKaltConfirmed: boolean;
  handoffDessertConfirmed: boolean;
  handoffConfirmedAt: string | null;
  stops: RouteStopDto[];
  skippedClosedFacilities: string[];
  arrivalOutsideWindowWarnings: string[];
}

const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : undefined);
const formatZeitpunkt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : undefined;

function toLieferRoute(dto: DeliveryRouteDto): LieferRoute {
  return {
    id: dto.id,
    name: dto.name,
    datum: dto.date,
    fahrerId: dto.driverId ?? undefined,
    fahrerName: dto.driverName ?? undefined,
    standortId: dto.locationId ?? undefined,
    start: trimTime(dto.plannedDepartureTime) ?? "",
    rueckkehr: trimTime(dto.plannedReturnTime),
    kilometer: dto.distanceKm ?? undefined,
    status: dto.status as RouteStatus,
    handoffWarmBestaetigt: dto.handoffWarmConfirmed,
    handoffKaltBestaetigt: dto.handoffKaltConfirmed,
    handoffDessertBestaetigt: dto.handoffDessertConfirmed,
    handoffBestaetigtAm: dto.handoffConfirmedAt ?? undefined,
    stopps: dto.stops.map((s) => ({
      id: s.id,
      einrichtungId: s.facilityId,
      einrichtungName: s.facilityName,
      einrichtungAdresse: s.facilityAddress,
      reihenfolge: s.sequenceNumber,
      ankunft: trimTime(s.plannedArrivalTime) ?? "",
      zeitfenster: s.deliveryWindowStart && s.deliveryWindowEnd ? `${trimTime(s.deliveryWindowStart)}–${trimTime(s.deliveryWindowEnd)}` : undefined,
      kontakt: s.contactName,
      telefon: s.contactPhone,
      hinweis: s.note ?? undefined,
      status: s.status as StoppStatus,
      problemHinweis: s.problemNote ?? undefined,
      zugestelltAm: formatZeitpunkt(s.deliveredAt),
      positionen: s.items.map((i) => ({
        id: i.id,
        rezeptId: i.recipeId,
        rezeptName: i.recipeName,
        portionen: i.portions,
        behaelter: i.containerDescription,
        temperatur: i.temperatureRequirement,
        hinweis: i.note ?? undefined,
        verpackt: i.isPacked,
        geladen: i.isLoaded,
      })),
    })),
  };
}

export const portionenJeRoute = (route: LieferRoute) => route.stopps.reduce((summe, stopp) => summe + stopp.positionen.reduce((teil, position) => teil + position.portionen, 0), 0);
export const behaelterPositionenJeRoute = (route: LieferRoute) => route.stopps.reduce((summe, stopp) => summe + stopp.positionen.length, 0);

export function useFahrer(): Fahrer[] {
  const query = useQuery({
    queryKey: ["drivers"],
    queryFn: () => api.get<PagedResult<DriverDto>>("/drivers?pageSize=100"),
  });
  return (query.data?.items ?? []).map((d) => ({ id: d.id, userId: d.userId, name: d.userName, telefon: d.phone, fahrzeug: d.vehicleDescription, kennzeichen: d.licensePlate }));
}

interface FahrerProfilInput {
  phone: string;
  vehicleDescription: string;
  licensePlate: string;
}

/** Legt das Fahrerprofil (Telefon/Fahrzeug/Kennzeichen) für einen Benutzer mit der Rolle DRIVER an —
 * ohne dieses Profil kann sich der Fahrer nicht anmelden (Backend verlangt es für alle Routen-Endpunkte). */
export function useCreateFahrer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FahrerProfilInput & { userId: string }) => api.post<DriverDto>("/drivers", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useUpdateFahrer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: FahrerProfilInput & { id: string }) => api.put<DriverDto>(`/drivers/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

/** Pollt alle 30s — das ist die Ansicht, über die ein Admin den Fortschritt der Fahrer auf ihren
 * Touren mitverfolgt (zugestellte/offene/Problem-Stopps), soll sich also ohne manuelles Neuladen
 * aktualisieren. */
export function useLieferRouten(filters?: { datum?: string; datumVon?: string; datumBis?: string; fahrerId?: string; status?: RouteStatus }): LieferRoute[] {
  const query = useQuery({
    queryKey: ["routes", filters],
    queryFn: () => api.get<PagedResult<DeliveryRouteDto>>(`/routes${toQueryString({ date: filters?.datum, dateFrom: filters?.datumVon, dateTo: filters?.datumBis, driverId: filters?.fahrerId, status: filters?.status, pageSize: 200 })}`),
    refetchInterval: 30_000,
  });
  return (query.data?.items ?? []).map(toLieferRoute);
}

/** Einzelne Route per Id — anders als /routes (Liste) auch für Fahrer erlaubt (mit serverseitiger
 * Zugriffsprüfung). `aktiv: false` schaltet die Abfrage komplett ab (z. B. sobald ein Fahrer die
 * Route gerade abgibt/übergibt und danach keinen Zugriff mehr hätte — siehe useRouteAbgeben) — ein
 * bloßes Entfernen aus dem Cache reicht nicht, weil die Komponente meist noch gemountet ist und beim
 * nächsten Render sofort neu abfragen würde, solange die Query aktiviert bleibt. */
export function useLieferRoute(id: string, aktiv = true): LieferRoute | undefined {
  const query = useQuery({
    queryKey: ["route", id],
    queryFn: () => api.get<DeliveryRouteDto>(`/routes/${id}`),
    enabled: !!id && aktiv,
    retry: false,
  });
  return query.data ? toLieferRoute(query.data) : undefined;
}

/** Routen des aktuell angemeldeten Fahrers (aus dem Token, keine fahrerId nötig). */
export function useAktuelleFahrerRouten(nurHeute = false): LieferRoute[] {
  const query = useQuery({
    queryKey: ["driver-current-routes", nurHeute],
    queryFn: () => api.get<DeliveryRouteDto[]>(`/drivers/current/routes${nurHeute ? "/today" : ""}`),
  });
  return (query.data ?? []).map(toLieferRoute);
}

export interface LieferRouteInput { name: string; datum: string; fahrerId?: string; standortId?: string; start: string; einrichtungIds: string[] }

export function useCreateLieferRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LieferRouteInput) =>
      api.post<DeliveryRouteDto>("/routes", {
        name: input.name,
        date: input.datum,
        driverId: input.fahrerId || null,
        locationId: input.standortId,
        plannedDepartureTime: input.start,
        facilityIds: input.einrichtungIds,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

/** Bearbeiten einer bestehenden Route (Name, Datum, Fahrer, Standort, Abfahrt, Kundenliste) — nur
 * möglich, solange die Route noch GEPLANT ist (siehe DeliveryRouteHandler.UpdateAsync). */
export function useUpdateLieferRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: LieferRouteInput }) =>
      api.put<DeliveryRouteDto>(`/routes/${id}`, {
        name: input.name,
        date: input.datum,
        driverId: input.fahrerId || null,
        locationId: input.standortId,
        plannedDepartureTime: input.start,
        facilityIds: input.einrichtungIds,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

/** Pool nicht übernommener Routen, die ein Fahrer sich selbst nehmen kann. */
export function useVerfuegbareRouten(datum?: string): LieferRoute[] {
  const query = useQuery({
    queryKey: ["routes-available", datum],
    queryFn: () => api.get<PagedResult<DeliveryRouteDto>>(`/routes${toQueryString({ date: datum, unassigned: true, pageSize: 100 })}`),
  });
  return (query.data?.items ?? []).map(toLieferRoute);
}

function invalidateRoutes(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["routes"] });
  queryClient.invalidateQueries({ queryKey: ["route"] });
  queryClient.invalidateQueries({ queryKey: ["driver-current-routes"] });
}

export function useUpdateRouteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RouteStatus }) => api.put<DeliveryRouteDto>(`/routes/${id}/status`, { status }),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

/** Bringt eine Route von ihrem aktuellen Status schrittweise auf den Zielstatus (Backend erlaubt nur Einzelschritte). */
export function useAdvanceRouteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ route, ziel }: { route: LieferRoute; ziel: RouteStatus }) => {
      let aktuell = route.status;
      let ergebnis: DeliveryRouteDto | undefined;
      while (aktuell !== ziel) {
        const nextIndex = ROUTE_STATUS_ORDER.indexOf(aktuell) + 1;
        const next = ROUTE_STATUS_ORDER[nextIndex];
        ergebnis = await api.put<DeliveryRouteDto>(`/routes/${route.id}/status`, { status: next });
        aktuell = next;
      }
      return ergebnis;
    },
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

/** Selbstständige Übernahme einer noch unvergebenen Route ("Route übernehmen"). */
export function useRouteUebernehmen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => api.post<DeliveryRouteDto>(`/routes/${routeId}/claim`),
    onSuccess: () => {
      invalidateRoutes(queryClient);
      queryClient.invalidateQueries({ queryKey: ["routes-available"] });
    },
  });
}

/** Gibt eine noch nicht gestartete Route zurück in den Pool (z. B. bei Krankheit) — Gegenstück zu
 * useRouteUebernehmen, damit ein anderer Fahrer die ganze Tour übernehmen kann. */
export function useRouteAbgeben() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => api.post<DeliveryRouteDto>(`/routes/${routeId}/release`),
    onSuccess: (_, routeId) => {
      // Nicht invalidateRoutes(): das würde die noch gemountete ["route", routeId]-Detailabfrage neu
      // laden, aber der Fahrer hat nach der Abgabe keinen Zugriff mehr darauf (GetByIdAsync antwortet
      // mit 403) — die Query wird deshalb aus dem Cache entfernt statt neu abgefragt, damit dieser
      // Request gar nicht erst losgeschickt wird.
      queryClient.removeQueries({ queryKey: ["route", routeId] });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["driver-current-routes"] });
      queryClient.invalidateQueries({ queryKey: ["routes-available"] });
    },
  });
}

/** Übergibt einen einzelnen, noch offenen Stopp direkt an die Route eines anderen Fahrers —
 * ohne Bestätigung durch diesen, Absprache erfolgt telefonisch/persönlich. */
export function useStoppUebertragen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, stoppId, zielRouteId }: { routeId: string; stoppId: string; zielRouteId: string }) =>
      api.post<DeliveryRouteDto>(`/routes/${routeId}/stops/${stoppId}/transfer`, { targetRouteId: zielRouteId }),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

/** Kurzfristiger Sonderauftrag/Zusatzkunde — hängt eine Einrichtung als neuen Stopp an eine
 * bestehende Route an, auch wenn diese schon beladen/unterwegs ist (nur ABGESCHLOSSEN sperrt). */
export function useStoppHinzufuegen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, einrichtungId }: { routeId: string; einrichtungId: string }) =>
      api.post<DeliveryRouteDto>(`/routes/${routeId}/stops`, { facilityId: einrichtungId }),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

interface DuplicateWeekResultDto { createdCount: number; skippedExisting: string[] }

/** Übernimmt alle Routen einer Woche (Mo–So) als Ausgangspunkt für eine andere Woche — Stopps
 * werden für die Zielwoche frisch aufgebaut (aktuelle Bestellungen/Schließtage berücksichtigt). */
export function useWocheDuplizieren() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quellwocheMontag, zielwocheMontag }: { quellwocheMontag: string; zielwocheMontag: string }) =>
      api.post<DuplicateWeekResultDto>("/routes/duplicate-week", { sourceWeekStart: quellwocheMontag, targetWeekStart: zielwocheMontag }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

/** Ersetzt die entfallene Küchen-Bestätigung: warm/kalt/Dessert je Route, vor Ladebeginn. */
export function useHandoffBestaetigen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, warm, kalt, dessert }: { routeId: string; warm: boolean; kalt: boolean; dessert: boolean }) =>
      api.put<DeliveryRouteDto>(`/routes/${routeId}/handoff`, { warmConfirmed: warm, kaltConfirmed: kalt, dessertConfirmed: dessert }),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

export function useUpdateStoppStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, stoppId, status, problemHinweis }: { routeId: string; stoppId: string; status: StoppStatus; problemHinweis?: string }) =>
      api.put<DeliveryRouteDto>(`/routes/${routeId}/stops/${stoppId}/status`, { status, problemNote: problemHinweis }),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

export function useToggleVerpackt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, stoppId, positionId }: { routeId: string; stoppId: string; positionId: string }) =>
      api.put<DeliveryRouteDto>(`/routes/${routeId}/stops/${stoppId}/items/${positionId}/packed`),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

export function useToggleGeladen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, stoppId, positionId }: { routeId: string; stoppId: string; positionId: string }) =>
      api.put<DeliveryRouteDto>(`/routes/${routeId}/stops/${stoppId}/items/${positionId}/loaded`),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

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
}

const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : undefined);

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

export function useLieferRouten(filters?: { datum?: string; fahrerId?: string; status?: RouteStatus }): LieferRoute[] {
  const query = useQuery({
    queryKey: ["routes", filters],
    queryFn: () => api.get<PagedResult<DeliveryRouteDto>>(`/routes${toQueryString({ date: filters?.datum, driverId: filters?.fahrerId, status: filters?.status, pageSize: 200 })}`),
  });
  return (query.data?.items ?? []).map(toLieferRoute);
}

/** Einzelne Route per Id — anders als /routes (Liste) auch für Fahrer erlaubt (mit serverseitiger Zugriffsprüfung). */
export function useLieferRoute(id: string): LieferRoute | undefined {
  const query = useQuery({
    queryKey: ["route", id],
    queryFn: () => api.get<DeliveryRouteDto>(`/routes/${id}`),
    enabled: !!id,
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

export function useCreateLieferRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; datum: string; fahrerId?: string; standortId?: string; start: string; einrichtungIds: string[] }) =>
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

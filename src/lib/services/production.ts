import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Einheit } from "@/lib/types";
import { unitToFrontend } from "./ingredients";

export type ProduktionsStatus = "PLANNED" | "PREPARING" | "COMPLETED" | "CANCELLED";
export type KitchenWorkStatus = "OFFEN" | "BEREITSTELLUNG" | "ZUBEREITUNG" | "FERTIG" | "VERPACKT" | "ABHOLBEREIT";

export interface ProduktionsPosition {
  id: string;
  rezeptId: string;
  rezeptName: string;
  bestellteMenge: number;
  zusatzMenge: number;
  begruendung?: string;
  status: ProduktionsStatus;
  workStatus: KitchenWorkStatus;
  stagedQuantity?: number;
  workstation?: string;
  equipment?: string;
  startTime?: string;
  finishByTime?: string;
  batchCount?: number;
  portionenJeCharge?: number;
  verantwortlich?: string;
}

export interface ProduktionsPlan {
  id: string;
  datum: string;
  standortId: string;
  standortName: string;
  positionen: ProduktionsPosition[];
}

interface ProductionPlanItemDto {
  id: string;
  recipeId: string;
  recipeName: string;
  orderedQuantity: number;
  adjustmentQuantity: number;
  adjustmentReason: string | null;
  status: string;
  workStatus: string;
  stagedQuantity: number | null;
  workstation: string | null;
  equipment: string | null;
  startTime: string | null;
  finishByTime: string | null;
  batchCount: number | null;
  portionsPerBatch: number | null;
  responsiblePerson: string | null;
}

interface ProductionPlanDto {
  id: string;
  date: string;
  locationId: string;
  locationName: string;
  items: ProductionPlanItemDto[];
}

const trimTime = (t: string | null) => (t ? t.slice(0, 5) : undefined);

function toProduktionsPlan(dto: ProductionPlanDto): ProduktionsPlan {
  return {
    id: dto.id,
    datum: dto.date,
    standortId: dto.locationId,
    standortName: dto.locationName,
    positionen: dto.items.map((i) => ({
      id: i.id,
      rezeptId: i.recipeId,
      rezeptName: i.recipeName,
      bestellteMenge: i.orderedQuantity,
      zusatzMenge: i.adjustmentQuantity,
      begruendung: i.adjustmentReason ?? undefined,
      status: i.status as ProduktionsStatus,
      workStatus: i.workStatus as KitchenWorkStatus,
      stagedQuantity: i.stagedQuantity ?? undefined,
      workstation: i.workstation ?? undefined,
      equipment: i.equipment ?? undefined,
      startTime: trimTime(i.startTime),
      finishByTime: trimTime(i.finishByTime),
      batchCount: i.batchCount ?? undefined,
      portionenJeCharge: i.portionsPerBatch ?? undefined,
      verantwortlich: i.responsiblePerson ?? undefined,
    })),
  };
}

export function useProduktionsplaene(filters?: { von?: string; bis?: string; standortId?: string }): ProduktionsPlan[] {
  const query = useQuery({
    queryKey: ["production-plans", filters],
    queryFn: () =>
      api.get<PagedResult<ProductionPlanDto>>(
        `/production-plans${toQueryString({ from: filters?.von, to: filters?.bis, locationId: filters?.standortId, pageSize: 200 })}`
      ),
  });
  return (query.data?.items ?? []).map(toProduktionsPlan);
}

export function useProduktionsplanByDatum(datum: string, standortId: string): ProduktionsPlan | undefined {
  const query = useQuery({
    queryKey: ["production-plan", datum, standortId],
    queryFn: () => api.get<ProductionPlanDto>(`/production-plans/${datum}${toQueryString({ locationId: standortId })}`),
    enabled: !!datum && !!standortId,
    retry: false,
  });
  return query.data ? toProduktionsPlan(query.data) : undefined;
}

export function useCreateProduktionsplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { datum: string; standortId: string }) =>
      api.post<ProductionPlanDto>("/production-plans", { date: input.datum, locationId: input.standortId }),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ["production-plans"] });
      queryClient.invalidateQueries({ queryKey: ["production-plan", plan.date, plan.locationId] });
    },
  });
}

function invalidatePlan(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["production-plans"] });
  queryClient.invalidateQueries({ queryKey: ["production-plan"] });
}

export function useUpdateProduktionsposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, itemId, updates }: { planId: string; itemId: string; updates: Partial<{ status: ProduktionsStatus; workStatus: KitchenWorkStatus }> }) =>
      api.put<ProductionPlanDto>(`/production-plans/${planId}/items/${itemId}`, updates),
    onSuccess: () => invalidatePlan(queryClient),
  });
}

export function useAddProduktionsAnpassung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, itemId, menge, begruendung }: { planId: string; itemId: string; menge: number; begruendung: string }) =>
      api.post<ProductionPlanDto>(`/production-plans/${planId}/items/${itemId}/adjustments`, { quantity: menge, reason: begruendung }),
    onSuccess: () => invalidatePlan(queryClient),
  });
}

export function useRefreshProduktionsplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => api.post<ProductionPlanDto>(`/production-plans/${planId}/refresh`),
    onSuccess: () => invalidatePlan(queryClient),
  });
}

export interface GesamtbedarfPosition {
  zutatId: string;
  name: string;
  menge: number;
  einheit: Einheit;
  kategorie: string;
  lagerort?: string;
  rezepte: string[];
}

interface IngredientRequirementDto {
  ingredientId: string;
  ingredientName: string;
  categoryName: string;
  unit: string;
  totalQuantity: number;
  storageLocationName: string | null;
  contributingRecipeNames: string[];
}

export function useProduktionsbedarf(planId: string): GesamtbedarfPosition[] {
  const query = useQuery({
    queryKey: ["production-plan-requirements", planId],
    queryFn: () => api.get<IngredientRequirementDto[]>(`/production-plans/${planId}/requirements`),
    enabled: !!planId,
  });
  return (query.data ?? []).map((r) => ({
    zutatId: r.ingredientId,
    name: r.ingredientName,
    menge: r.totalQuantity,
    einheit: unitToFrontend(r.unit),
    kategorie: r.categoryName,
    lagerort: r.storageLocationName ?? undefined,
    rezepte: r.contributingRecipeNames,
  }));
}

/* ---------- Abweichungen (Deviations) ---------- */

export type AbweichungStatus = "OFFEN" | "GEKLÄRT";
export const ABWEICHUNG_KATEGORIEN = ["Fehlbestand", "Produktionsmenge", "Qualität", "Temperatur", "Gerät", "Verspätung"] as const;
export type AbweichungKategorie = (typeof ABWEICHUNG_KATEGORIEN)[number];

const kategorieToBackend: Record<AbweichungKategorie, string> = {
  Fehlbestand: "Fehlbestand",
  Produktionsmenge: "Produktionsmenge",
  Qualität: "Qualitaet",
  Temperatur: "Temperatur",
  Gerät: "Geraet",
  Verspätung: "Verspaetung",
};
const kategorieToFrontend: Record<string, AbweichungKategorie> = {
  Fehlbestand: "Fehlbestand",
  Produktionsmenge: "Produktionsmenge",
  Qualitaet: "Qualität",
  Temperatur: "Temperatur",
  Geraet: "Gerät",
  Verspaetung: "Verspätung",
};

export interface Abweichung {
  id: string;
  zeit: string;
  kategorie: AbweichungKategorie;
  betreff: string;
  menge: string;
  massnahme: string;
  person: string;
  status: AbweichungStatus;
}

interface DeviationDto {
  id: string;
  productionPlanId: string | null;
  category: string;
  subject: string;
  quantity: string | null;
  action: string;
  reportedByUserName: string;
  reportedAt: string;
  status: string;
  resolvedAt: string | null;
}

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
const statusToFrontend = (s: string): AbweichungStatus => (s === "GEKLAERT" ? "GEKLÄRT" : "OFFEN");

function toAbweichung(dto: DeviationDto): Abweichung {
  return {
    id: dto.id,
    zeit: formatTime(dto.reportedAt),
    kategorie: kategorieToFrontend[dto.category] ?? "Fehlbestand",
    betreff: dto.subject,
    menge: dto.quantity ?? "—",
    massnahme: dto.action,
    person: dto.reportedByUserName,
    status: statusToFrontend(dto.status),
  };
}

export function useAbweichungen(): Abweichung[] {
  const query = useQuery({ queryKey: ["deviations"], queryFn: () => api.get<PagedResult<DeviationDto>>("/deviations?pageSize=200") });
  return (query.data?.items ?? []).map(toAbweichung);
}

export function useCreateAbweichung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { kategorie: AbweichungKategorie; betreff: string; menge?: string; massnahme: string; produktionsplanId?: string }) =>
      api.post<DeviationDto>("/deviations", {
        productionPlanId: input.produktionsplanId,
        category: kategorieToBackend[input.kategorie],
        subject: input.betreff,
        quantity: input.menge || undefined,
        action: input.massnahme,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deviations"] }),
  });
}

export function useResolveAbweichung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<DeviationDto>(`/deviations/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deviations"] }),
  });
}

/* ---------- Kontrollen (Quality Controls / HACCP) ---------- */

export const KONTROLL_ARTEN = ["Kerntemperatur", "Warmhaltetemperatur", "Kühltemperatur", "Wareneingang"] as const;
export type KontrollArt = (typeof KONTROLL_ARTEN)[number];

const artToBackend: Record<KontrollArt, string> = {
  Kerntemperatur: "Kerntemperatur",
  Warmhaltetemperatur: "Warmhaltetemperatur",
  Kühltemperatur: "Kuehltemperatur",
  Wareneingang: "Wareneingang",
};
const artToFrontend: Record<string, KontrollArt> = {
  Kerntemperatur: "Kerntemperatur",
  Warmhaltetemperatur: "Warmhaltetemperatur",
  Kuehltemperatur: "Kühltemperatur",
  Wareneingang: "Wareneingang",
};

export interface Kontrolle {
  id: string;
  zeit: string;
  art: KontrollArt;
  bereich: string;
  soll: string;
  ist: string;
  person: string;
  status: "OK" | "NOK";
}

interface QualityControlDto {
  id: string;
  productionPlanId: string | null;
  type: string;
  area: string;
  targetValue: string;
  measuredValue: string;
  performedByUserName: string;
  performedAt: string;
  status: string;
}

function toKontrolle(dto: QualityControlDto): Kontrolle {
  return {
    id: dto.id,
    zeit: formatTime(dto.performedAt),
    art: artToFrontend[dto.type] ?? "Kerntemperatur",
    bereich: dto.area,
    soll: dto.targetValue,
    ist: dto.measuredValue,
    person: dto.performedByUserName,
    status: dto.status as "OK" | "NOK",
  };
}

export function useKontrollen(): Kontrolle[] {
  const query = useQuery({ queryKey: ["quality-controls"], queryFn: () => api.get<PagedResult<QualityControlDto>>("/quality-controls?pageSize=200") });
  return (query.data?.items ?? []).map(toKontrolle);
}

export function useCreateKontrolle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { art: KontrollArt; bereich: string; soll: string; ist: string; produktionsplanId?: string }) =>
      api.post<QualityControlDto>("/quality-controls", {
        productionPlanId: input.produktionsplanId,
        type: artToBackend[input.art],
        area: input.bereich,
        targetValue: input.soll,
        measuredValue: input.ist,
        status: "OK",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quality-controls"] }),
  });
}

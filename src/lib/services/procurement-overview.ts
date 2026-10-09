import { useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { Einheit } from "@/lib/types";
import { unitToFrontend } from "./ingredients";

/** Rollup über bestätigte Bestellungen — Kalenderwoche → Rezepte → Zutatenbedarf. Unabhängig vom
 * bestehenden Produktionsplan/Einkaufslisten-Workflow (beide pro Tag, erfordern vorab angelegte
 * Pläne): liest direkt aus bestätigten Bestellungen, steht also sofort für die ganze Woche zur
 * Verfügung, sobald Bestellungen bestätigt sind. Siehe ProcurementOverviewHandler im Backend. */

export interface EinkaufsWoche {
  jahr: number;
  kalenderwoche: number;
  bestaetigteBestellungen: number;
  portionenGesamt: number;
}

export interface WochenRezeptBedarf {
  rezeptId: string;
  rezeptName: string;
  portionenGesamt: number;
  einrichtungenAnzahl: number;
  /** Rezeptpreis je Portion (manuell gepflegt oder aus Zutatenpreisen berechnet). */
  preisProPortion?: number;
  preisManuell: boolean;
  kostenGesamt?: number;
}

export interface WochenZutatBedarf {
  zutatId: string;
  zutatName: string;
  kategorie: string;
  einheit: Einheit;
  gesamtmenge: number;
  lagerort?: string;
  verwendetIn: string[];
  /** Preis je preisEinheit — günstigster Lieferant (lieferantName) bzw. Standardpreis. */
  preis?: number;
  preisEinheit?: Einheit;
  lieferantName?: string;
  kostenGesamt?: number;
}

interface ProcurementWeekDto {
  year: number;
  calendarWeek: number;
  confirmedOrderCount: number;
  totalPortions: number;
}

interface WeekRecipeRequirementDto {
  recipeId: string;
  recipeName: string;
  totalPortions: number;
  facilityCount: number;
  costPerPortion: number | null;
  costIsManual: boolean;
  totalCost: number | null;
}

interface IngredientRequirementDto {
  ingredientId: string;
  ingredientName: string;
  categoryName: string;
  unit: string;
  totalQuantity: number;
  storageLocationName: string | null;
  contributingRecipeNames: string[];
  unitPrice: number | null;
  priceUnit: string | null;
  supplierName: string | null;
  totalCost: number | null;
}

/** Alle Kalenderwochen mit mindestens einer bestätigten Bestellung, neueste zuerst. */
export function useEinkaufsWochen(standortId?: string): EinkaufsWoche[] {
  const query = useQuery({
    queryKey: ["procurement-overview-weeks", standortId],
    queryFn: () => api.get<ProcurementWeekDto[]>(`/procurement/overview/weeks${toQueryString({ locationId: standortId })}`),
  });
  return (query.data ?? []).map((w) => ({ jahr: w.year, kalenderwoche: w.calendarWeek, bestaetigteBestellungen: w.confirmedOrderCount, portionenGesamt: w.totalPortions }));
}

/** Rezepte, die in einer Kalenderwoche über alle bestätigten Bestellungen hinweg gebraucht werden. */
export function useWochenRezeptBedarf(jahr?: number, kalenderwoche?: number, standortId?: string): WochenRezeptBedarf[] {
  const query = useQuery({
    queryKey: ["procurement-overview-week-recipes", jahr, kalenderwoche, standortId],
    queryFn: () => api.get<WeekRecipeRequirementDto[]>(`/procurement/overview/weeks/${jahr}/${kalenderwoche}/recipes${toQueryString({ locationId: standortId })}`),
    enabled: jahr != null && kalenderwoche != null,
  });
  return (query.data ?? []).map((r) => ({
    rezeptId: r.recipeId,
    rezeptName: r.recipeName,
    portionenGesamt: r.totalPortions,
    einrichtungenAnzahl: r.facilityCount,
    preisProPortion: r.costPerPortion ?? undefined,
    preisManuell: r.costIsManual,
    kostenGesamt: r.totalCost ?? undefined,
  }));
}

/** Zutaten-Gesamtbedarf einer Kalenderwoche, über alle Rezepte/Tage hinweg aggregiert — die
 * Einkaufsmenge, die der Chef für die Lieferantenbestellung braucht. */
export function useWochenZutatBedarf(jahr?: number, kalenderwoche?: number, standortId?: string): WochenZutatBedarf[] {
  const query = useQuery({
    queryKey: ["procurement-overview-week-ingredients", jahr, kalenderwoche, standortId],
    queryFn: () => api.get<IngredientRequirementDto[]>(`/procurement/overview/weeks/${jahr}/${kalenderwoche}/ingredients${toQueryString({ locationId: standortId })}`),
    enabled: jahr != null && kalenderwoche != null,
  });
  return (query.data ?? []).map((i) => ({
    zutatId: i.ingredientId,
    zutatName: i.ingredientName,
    kategorie: i.categoryName,
    einheit: unitToFrontend(i.unit),
    gesamtmenge: i.totalQuantity,
    lagerort: i.storageLocationName ?? undefined,
    verwendetIn: i.contributingRecipeNames,
    preis: i.unitPrice ?? undefined,
    preisEinheit: i.priceUnit ? unitToFrontend(i.priceUnit) : undefined,
    lieferantName: i.supplierName ?? undefined,
    kostenGesamt: i.totalCost ?? undefined,
  }));
}

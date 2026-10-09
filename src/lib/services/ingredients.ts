import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiFetchUpload } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Einheit } from "@/lib/types";

export interface Naehrwerte {
  kcal: number;
  kj: number;
  eiweissG: number;
  fettG: number;
  gesFettSaeurenG: number;
  kohlenhydrateG: number;
  zuckerG: number;
  ballaststoffeG: number;
  salzG: number;
  alkoholG: number;
  quelle: "Open Food Facts" | "USDA FoodData Central" | "Manuell" | "Bundeslebensmittelschlüssel (BLS)";
}

export interface ZutatLieferantenpreis {
  id: string;
  zutatId: string;
  lieferantId: string;
  lieferantName: string;
  lieferantArtikelnummer: string;
  preis: number;
  einheit: Einheit;
  verfuegbarkeitshinweis?: string;
}

export interface Zutat {
  id: string;
  name: string;
  artikelnummer: string;
  kategorie: string;
  basiseinheit: Einheit;
  einkaufseinheit: string;
  umrechnungsfaktor: number;
  einkaufspreis?: number;
  lieferant: string;
  allergene: string[];
  zusatzstoffe: string[];
  vegetarisch: boolean;
  vegan: boolean;
  bio: boolean;
  regional: boolean;
  aktiv: boolean;
  naehrwertePro100: Naehrwerte;
  /** "Rezeptrechner" (importiert) oder "Manuell" (von Fee angelegt/bearbeitet). */
  quelle: "Rezeptrechner" | "Manuell";
  manuellBearbeitet: boolean;
  lieferantenpreise: ZutatLieferantenpreis[];
  guenstigsterLieferantName?: string;
  guenstigsterPreis?: number;
}

interface LookupDto {
  id: string;
  name: string;
}

interface IngredientDto {
  id: string;
  name: string;
  articleNumber: string;
  categoryId: string;
  categoryName: string;
  supplierId: string | null;
  supplierName: string | null;
  baseUnit: string;
  purchaseUnit: string;
  conversionFactor: number;
  purchasePrice: number | null;
  vegetarian: boolean;
  vegan: boolean;
  bio: boolean;
  regional: boolean;
  active: boolean;
  nutrition: {
    kcal: number; kj: number; proteinG: number; fatG: number; saturatedFatG: number;
    carbsG: number; sugarG: number; fiberG: number; saltG: number; alcoholG: number; source: string;
  };
  allergenNames: string[];
  allergenIds: string[];
  additives: string[];
  source: string;
  externalRefId: string | null;
  isManuallyEdited: boolean;
  lastSyncedAt: string | null;
  supplierPrices: IngredientSupplierPriceDto[];
  cheapestSupplierPriceId: string | null;
  cheapestSupplierName: string | null;
  cheapestPrice: number | null;
}

interface IngredientSupplierPriceDto {
  id: string;
  ingredientId: string;
  supplierId: string;
  supplierName: string;
  supplierArticleNumber: string;
  price: number;
  unit: string;
  availabilityNote: string | null;
}

function toZutatLieferantenpreis(dto: IngredientSupplierPriceDto): ZutatLieferantenpreis {
  return {
    id: dto.id,
    zutatId: dto.ingredientId,
    lieferantId: dto.supplierId,
    lieferantName: dto.supplierName,
    lieferantArtikelnummer: dto.supplierArticleNumber,
    preis: dto.price,
    einheit: unitToFrontend(dto.unit),
    verfuegbarkeitshinweis: dto.availabilityNote ?? undefined,
  };
}

// Backend enum member "Stueck" (C# identifiers can't hold umlauts) <-> frontend literal "Stück".
export const unitToFrontend = (u: string): Einheit => (u === "Stueck" ? "Stück" : (u as Einheit));
export const unitToBackend = (u: Einheit): string => (u === "Stück" ? "Stueck" : u);

const quelleToFrontend: Record<string, Naehrwerte["quelle"]> = {
  OpenFoodFacts: "Open Food Facts",
  Usda: "USDA FoodData Central",
  Manuell: "Manuell",
  Bls: "Bundeslebensmittelschlüssel (BLS)",
};
const quelleToBackend: Record<Naehrwerte["quelle"], string> = {
  "Open Food Facts": "OpenFoodFacts",
  "USDA FoodData Central": "Usda",
  Manuell: "Manuell",
  "Bundeslebensmittelschlüssel (BLS)": "Bls",
};

function toZutat(dto: IngredientDto): Zutat {
  return {
    id: dto.id,
    name: dto.name,
    artikelnummer: dto.articleNumber,
    kategorie: dto.categoryName,
    basiseinheit: unitToFrontend(dto.baseUnit),
    einkaufseinheit: dto.purchaseUnit,
    umrechnungsfaktor: dto.conversionFactor,
    einkaufspreis: dto.purchasePrice ?? undefined,
    lieferant: dto.supplierName ?? "",
    allergene: dto.allergenNames,
    zusatzstoffe: dto.additives,
    vegetarisch: dto.vegetarian,
    vegan: dto.vegan,
    bio: dto.bio,
    regional: dto.regional,
    aktiv: dto.active,
    naehrwertePro100: {
      kcal: dto.nutrition.kcal,
      kj: dto.nutrition.kj,
      eiweissG: dto.nutrition.proteinG,
      fettG: dto.nutrition.fatG,
      gesFettSaeurenG: dto.nutrition.saturatedFatG,
      kohlenhydrateG: dto.nutrition.carbsG,
      zuckerG: dto.nutrition.sugarG,
      ballaststoffeG: dto.nutrition.fiberG,
      salzG: dto.nutrition.saltG,
      alkoholG: dto.nutrition.alcoholG,
      quelle: quelleToFrontend[dto.nutrition.source] ?? "Manuell",
    },
    quelle: dto.source === "Rezeptrechner" ? "Rezeptrechner" : "Manuell",
    manuellBearbeitet: dto.isManuallyEdited,
    lieferantenpreise: dto.supplierPrices.map(toZutatLieferantenpreis),
    guenstigsterLieferantName: dto.cheapestSupplierName ?? undefined,
    guenstigsterPreis: dto.cheapestPrice ?? undefined,
  };
}

export function useIngredientCategories() {
  const query = useQuery({ queryKey: ["ingredient-categories"], queryFn: () => api.get<LookupDto[]>("/ingredient-categories") });
  return query.data ?? [];
}

export function useAllergensLookup() {
  const query = useQuery({ queryKey: ["allergens"], queryFn: () => api.get<LookupDto[]>("/allergens") });
  return query.data ?? [];
}

export interface Lieferant {
  id: string;
  name: string;
  ansprechpartner?: string;
  telefon?: string;
  email?: string;
  /** Anzahl der Zutatenpreise in der Preisliste dieses Lieferanten. */
  anzahlPreise: number;
}

interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  priceCount: number;
}

const toLieferant = (dto: SupplierDto): Lieferant => ({
  id: dto.id,
  name: dto.name,
  ansprechpartner: dto.contactPerson ?? undefined,
  telefon: dto.phone ?? undefined,
  email: dto.email ?? undefined,
  anzahlPreise: dto.priceCount,
});

export function useSuppliers(): Lieferant[] {
  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<PagedResult<SupplierDto>>("/suppliers?pageSize=200"),
  });
  return (query.data?.items ?? []).map(toLieferant);
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<{ id: string; name: string }>("/suppliers", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (l: Omit<Lieferant, "anzahlPreise">) =>
      api.put<SupplierDto>(`/suppliers/${l.id}`, { name: l.name, contactPerson: l.ansprechpartner || null, phone: l.telefon || null, email: l.email || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices"] });
    },
  });
}

/** Löscht den Lieferanten samt Preisliste — schlägt mit 409 fehl, solange Einkaufslisten auf ihn
 * verweisen (siehe SupplierHandler.DeleteAsync); dann bleibt nur useClearSupplierPrices. */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices"] });
    },
  });
}

/** Leert die Preisliste eines Lieferanten (alle seine Zutatenpreise), der Lieferant bleibt bestehen. */
export function useClearSupplierPrices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<number>(`/suppliers/${id}/prices`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices"] });
    },
  });
}

export function useZutaten(): Zutat[] {
  const query = useQuery({
    queryKey: ["ingredients"],
    queryFn: () => api.get<PagedResult<IngredientDto>>("/ingredients?pageSize=500"),
  });
  return (query.data?.items ?? []).map(toZutat);
}

/** Resolves a free-text supplier name to a SupplierId, creating the supplier if it doesn't exist
 * yet — the backend normalizes suppliers into their own table, but the form keeps the original
 * free-text UX. */
async function resolveSupplierId(name: string): Promise<string | undefined> {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const existing = await api.get<PagedResult<{ id: string; name: string }>>(`/suppliers?search=${encodeURIComponent(trimmed)}&pageSize=50`);
  const match = existing.items.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match.id;
  const created = await api.post<{ id: string }>("/suppliers", { name: trimmed });
  return created.id;
}

async function toSaveDto(input: Omit<Zutat, "id">, categories: LookupDto[], allergens: LookupDto[]) {
  const category = categories.find((c) => c.name === input.kategorie);
  const allergenIds = input.allergene.map((name) => allergens.find((a) => a.name === name)?.id).filter((id): id is string => !!id);
  const supplierId = await resolveSupplierId(input.lieferant);

  return {
    name: input.name,
    articleNumber: input.artikelnummer,
    categoryId: category?.id ?? categories[0]?.id,
    supplierId,
    baseUnit: unitToBackend(input.basiseinheit),
    purchaseUnit: input.einkaufseinheit,
    conversionFactor: input.umrechnungsfaktor || 1,
    purchasePrice: input.einkaufspreis ?? null,
    vegetarian: input.vegetarisch,
    vegan: input.vegan,
    bio: input.bio,
    regional: input.regional,
    active: input.aktiv,
    nutrition: {
      kcal: input.naehrwertePro100.kcal,
      kj: input.naehrwertePro100.kj,
      proteinG: input.naehrwertePro100.eiweissG,
      fatG: input.naehrwertePro100.fettG,
      saturatedFatG: input.naehrwertePro100.gesFettSaeurenG,
      carbsG: input.naehrwertePro100.kohlenhydrateG,
      sugarG: input.naehrwertePro100.zuckerG,
      fiberG: input.naehrwertePro100.ballaststoffeG,
      saltG: input.naehrwertePro100.salzG,
      alcoholG: input.naehrwertePro100.alkoholG,
      source: quelleToBackend[input.naehrwertePro100.quelle],
    },
    allergenIds,
    additives: input.zusatzstoffe,
  };
}

export function useCreateZutat() {
  const queryClient = useQueryClient();
  const categories = useIngredientCategories();
  const allergens = useAllergensLookup();
  return useMutation({
    mutationFn: async (input: Omit<Zutat, "id">) => {
      const dto = await toSaveDto(input, categories, allergens);
      return api.post<IngredientDto>("/ingredients", dto);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

export function useUpdateZutat() {
  const queryClient = useQueryClient();
  const categories = useIngredientCategories();
  const allergens = useAllergensLookup();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Omit<Zutat, "id"> }) => {
      const dto = await toSaveDto(input, categories, allergens);
      return api.put<IngredientDto>(`/ingredients/${id}`, dto);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

/** Endgültiges Löschen — schlägt mit 409 fehl, wenn die Zutat bereits in einer Rezeptur oder einer
 * Beschaffungsliste verwendet wird (siehe IngredientHandler.DeleteAsync). */
export function useDeleteZutat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ingredients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

// ---- Lieferantenpreise ----

export function useIngredientSupplierPrices(zutatId: string) {
  const query = useQuery({
    queryKey: ["ingredient-prices", zutatId],
    queryFn: () => api.get<IngredientSupplierPriceDto[]>(`/ingredients/${zutatId}/prices`),
    enabled: !!zutatId,
  });
  return (query.data ?? []).map(toZutatLieferantenpreis);
}

export interface SaveLieferantenpreisInput {
  lieferantId: string;
  lieferantArtikelnummer: string;
  preis: number;
  einheit: Einheit;
  verfuegbarkeitshinweis?: string;
}

function toSavePriceDto(input: SaveLieferantenpreisInput) {
  return {
    supplierId: input.lieferantId,
    supplierArticleNumber: input.lieferantArtikelnummer,
    price: input.preis,
    unit: unitToBackend(input.einheit),
    availabilityNote: input.verfuegbarkeitshinweis || null,
  };
}

export function useSaveSupplierPrice(zutatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveLieferantenpreisInput) => api.post<IngredientSupplierPriceDto>(`/ingredients/${zutatId}/prices`, toSavePriceDto(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices", zutatId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useUpdateSupplierPrice(zutatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ preisId, input }: { preisId: string; input: SaveLieferantenpreisInput }) =>
      api.put<IngredientSupplierPriceDto>(`/ingredients/${zutatId}/prices/${preisId}`, toSavePriceDto(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices", zutatId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useDeleteSupplierPrice(zutatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preisId: string) => api.delete(`/ingredients/${zutatId}/prices/${preisId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices", zutatId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

// ---- Preislisten-Import (CSV/XLSX) je Lieferant ----

export interface PreislistenImportErgebnis {
  gefunden: number;
  nichtGefunden: { zeile: number; grund: string }[];
}

export function useImportSupplierPriceList(lieferantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<PreislistenImportErgebnis> => {
      const result = await apiFetchUpload<{ matched: number; unmatched: { rowNumber: number; reason: string }[] }>(`/suppliers/${lieferantId}/price-import`, file);
      return { gefunden: result.matched, nichtGefunden: result.unmatched.map((u) => ({ zeile: u.rowNumber, grund: u.reason })) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["ingredient-prices"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

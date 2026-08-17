import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Einheit } from "@/lib/types";

export interface Naehrwerte {
  kcal: number;
  eiweissG: number;
  fettG: number;
  kohlenhydrateG: number;
  zuckerG: number;
  salzG: number;
  quelle: "Open Food Facts" | "USDA FoodData Central" | "Manuell";
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
  nutrition: { kcal: number; proteinG: number; fatG: number; carbsG: number; sugarG: number; saltG: number; source: string };
  allergenNames: string[];
  allergenIds: string[];
  additives: string[];
}

// Backend enum member "Stueck" (C# identifiers can't hold umlauts) <-> frontend literal "Stück".
export const unitToFrontend = (u: string): Einheit => (u === "Stueck" ? "Stück" : (u as Einheit));
export const unitToBackend = (u: Einheit): string => (u === "Stück" ? "Stueck" : u);

const quelleToFrontend: Record<string, Naehrwerte["quelle"]> = {
  OpenFoodFacts: "Open Food Facts",
  Usda: "USDA FoodData Central",
  Manuell: "Manuell",
};
const quelleToBackend: Record<Naehrwerte["quelle"], string> = {
  "Open Food Facts": "OpenFoodFacts",
  "USDA FoodData Central": "Usda",
  Manuell: "Manuell",
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
      eiweissG: dto.nutrition.proteinG,
      fettG: dto.nutrition.fatG,
      kohlenhydrateG: dto.nutrition.carbsG,
      zuckerG: dto.nutrition.sugarG,
      salzG: dto.nutrition.saltG,
      quelle: quelleToFrontend[dto.nutrition.source] ?? "Manuell",
    },
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
    nutrition: {
      kcal: input.naehrwertePro100.kcal,
      proteinG: input.naehrwertePro100.eiweissG,
      fatG: input.naehrwertePro100.fettG,
      carbsG: input.naehrwertePro100.kohlenhydrateG,
      sugarG: input.naehrwertePro100.zuckerG,
      saltG: input.naehrwertePro100.salzG,
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

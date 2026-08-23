import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Rezept, NutriScore } from "@/features/recipes/types";
import { unitToFrontend, unitToBackend } from "./ingredients";

export type { Rezept, RezeptZutat, RezeptNaehrwerte100, Schwierigkeitsgrad, NutriScore } from "@/features/recipes/types";
export {
  rezeptAllergeneLive,
  rezeptZusatzstoffeLive,
  rezeptBioAnteilLive,
  rezeptRegionalAnteilLive,
  rezeptWareneinsatzLive,
  naehrwerteProPortion,
} from "@/features/recipes/store";

interface LookupDto {
  id: string;
  name: string;
}

interface RecipeIngredientDto {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface RecipeDto {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  recipeNumber: string | null;
  standardPortions: number;
  portionWeightG: number | null;
  prepTimeMinutes: number;
  difficulty: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
  dgeCertified: boolean;
  estimatedCostPerPortion: number | null;
  productionNotes: string | null;
  imageUrl: string | null;
  coreTemperatureC: number | null;
  storageNote: string | null;
  shelfLifeAfterPrep: string | null;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string | null;
  createdByUserName: string;
  prepSteps: string[];
  ingredients: RecipeIngredientDto[];
  resolvedAllergens: string[];
  allergensAreOverridden: boolean;
  resolvedAdditives: string[];
  additivesAreOverridden: boolean;
  nutriScore: string | null;
  nutritionIsAuthoritative: boolean;
  targetGroupIds: string[];
  targetGroupNames: string[];
}

interface RecipeScaleIngredientDto {
  ingredientId: string;
  ingredientName: string;
  originalQuantity: number;
  scaledQuantity: number;
  unit: string;
}

interface RecipeScaleResultDto {
  factor: number;
  ingredients: RecipeScaleIngredientDto[];
}

export interface RezeptSkaliert {
  faktor: number;
  zutaten: { zutatId: string; name: string; originalMenge: number; hochgerechnet: number; einheit: string }[];
}

function toRezept(dto: RecipeDto): Rezept {
  return {
    id: dto.id,
    name: dto.name,
    beschreibung: dto.description,
    kategorie: dto.categoryName,
    rezeptnummer: dto.recipeNumber ?? undefined,
    standardPortionen: dto.standardPortions,
    portionsgewichtG: dto.portionWeightG ?? undefined,
    zubereitungszeitMin: dto.prepTimeMinutes,
    schwierigkeit: dto.difficulty as Rezept["schwierigkeit"],
    zubereitungsschritte: dto.prepSteps,
    zutaten: dto.ingredients.map((i) => ({ zutatId: i.ingredientId, menge: i.quantity, einheit: unitToFrontend(i.unit) })),
    vegetarisch: dto.vegetarian,
    vegan: dto.vegan,
    glutenfrei: dto.glutenFree,
    laktosefrei: dto.lactoseFree,
    dgeZertifiziert: dto.dgeCertified,
    geschaetzteKostenProPortion: dto.estimatedCostPerPortion ?? undefined,
    produktionshinweise: dto.productionNotes ?? undefined,
    zielgruppen: dto.targetGroupNames,
    bildUrl: dto.imageUrl ?? undefined,
    kerntemperaturC: dto.coreTemperatureC ?? undefined,
    lagerhinweis: dto.storageNote ?? undefined,
    haltbarkeitNachZubereitung: dto.shelfLifeAfterPrep ?? undefined,
    erstelltVon: dto.createdByUserName,
    erstelltAm: dto.createdAt,
    aktualisiertAm: dto.updatedAt ?? undefined,
    aktiv: dto.active,
    version: dto.version,
    allergeneErfasst: dto.resolvedAllergens,
    zusatzstoffeErfasst: dto.resolvedAdditives,
    nutriScore: (dto.nutriScore as NutriScore) ?? undefined,
  };
}

export function useRecipeCategories() {
  const query = useQuery({ queryKey: ["recipe-categories"], queryFn: () => api.get<LookupDto[]>("/recipe-categories") });
  return query.data ?? [];
}

export function useTargetAudienceGroups() {
  const query = useQuery({ queryKey: ["target-audience-groups"], queryFn: () => api.get<LookupDto[]>("/target-audience-groups") });
  return query.data ?? [];
}

export function useRezepte(): Rezept[] {
  const query = useQuery({
    queryKey: ["recipes"],
    queryFn: () => api.get<PagedResult<RecipeDto>>("/recipes?pageSize=500"),
  });
  return (query.data?.items ?? []).map(toRezept);
}

type RezeptFormDaten = Omit<Rezept, "id" | "version" | "erstelltVon" | "erstelltAm" | "aktualisiertAm">;

function toSaveDto(input: RezeptFormDaten, categories: LookupDto[], targetGroups: LookupDto[]) {
  const category = categories.find((c) => c.name === input.kategorie);
  const targetGroupIds = input.zielgruppen
    .map((name) => targetGroups.find((g) => g.name === name)?.id)
    .filter((id): id is string => !!id);

  return {
    name: input.name,
    description: input.beschreibung,
    categoryId: category?.id ?? categories[0]?.id,
    recipeNumber: input.rezeptnummer || null,
    standardPortions: input.standardPortionen,
    portionWeightG: input.portionsgewichtG ?? null,
    prepTimeMinutes: input.zubereitungszeitMin,
    difficulty: input.schwierigkeit,
    vegetarian: input.vegetarisch,
    vegan: input.vegan,
    glutenFree: input.glutenfrei,
    lactoseFree: input.laktosefrei,
    dgeCertified: input.dgeZertifiziert,
    active: input.aktiv,
    productionNotes: input.produktionshinweise || null,
    imageUrl: input.bildUrl || null,
    coreTemperatureC: input.kerntemperaturC ?? null,
    storageNote: input.lagerhinweis || null,
    shelfLifeAfterPrep: input.haltbarkeitNachZubereitung || null,
    prepSteps: input.zubereitungsschritte,
    ingredients: input.zutaten.map((rz) => ({ ingredientId: rz.zutatId, quantity: rz.menge, unit: unitToBackend(rz.einheit) })),
    targetGroupIds,
  };
}

export function useCreateRezept() {
  const queryClient = useQueryClient();
  const categories = useRecipeCategories();
  const targetGroups = useTargetAudienceGroups();
  return useMutation({
    mutationFn: (input: RezeptFormDaten) => api.post<RecipeDto>("/recipes", toSaveDto(input, categories, targetGroups)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });
}

export function useUpdateRezept() {
  const queryClient = useQueryClient();
  const categories = useRecipeCategories();
  const targetGroups = useTargetAudienceGroups();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RezeptFormDaten }) =>
      api.put<RecipeDto>(`/recipes/${id}`, toSaveDto(input, categories, targetGroups)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });
}

export function useDuplicateRezept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<RecipeDto>(`/recipes/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });
}

export function useArchiveRezept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/recipes/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });
}

export function useRezeptSkaliert(id: string, portionen: number): RezeptSkaliert | undefined {
  const query = useQuery({
    queryKey: ["recipe-scale", id, portionen],
    queryFn: () => api.get<RecipeScaleResultDto>(`/recipes/${id}/scale?portions=${portionen}`),
    enabled: !!id && portionen > 0,
  });
  if (!query.data) return undefined;
  return {
    faktor: query.data.factor,
    zutaten: query.data.ingredients.map((i) => ({
      zutatId: i.ingredientId,
      name: i.ingredientName,
      originalMenge: i.originalQuantity,
      hochgerechnet: i.scaledQuantity,
      einheit: unitToFrontend(i.unit),
    })),
  };
}

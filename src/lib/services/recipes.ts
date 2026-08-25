import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiFetchUploadMulti } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Rezept, NutriScore, RezeptNaehrwerte100 } from "@/features/recipes/types";
import type { Einheit } from "@/lib/types";
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

interface RecipeNutritionDto {
  kcal: number;
  kj: number;
  fatG: number;
  saturatedFatG: number;
  carbsG: number;
  sugarG: number;
  fiberG: number;
  proteinG: number;
  saltG: number;
  alcoholG: number;
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
  nutrition: RecipeNutritionDto | null;
  productionNotes: string | null;
  imageUrl: string | null;
  coreTemperatureC: number | null;
  storageNote: string | null;
  shelfLifeAfterPrep: string | null;
  reductionFactor: number;
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
  nutriScoreCategory: string | null;
  nutritionIsAuthoritative: boolean;
  nutritionClaims: string[];
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
    reduktionsfaktor: dto.reductionFactor,
    allergeneErfasst: dto.resolvedAllergens,
    zusatzstoffeErfasst: dto.resolvedAdditives,
    nutriScore: (dto.nutriScore as NutriScore) ?? undefined,
    nutriScoreKategorie: dto.nutriScoreCategory ?? undefined,
    naehrwertbezogeneAngaben: dto.nutritionClaims,
    naehrwertePro100g: dto.nutrition
      ? {
          kcal: dto.nutrition.kcal,
          kj: dto.nutrition.kj,
          fettG: dto.nutrition.fatG,
          gesFettSaeurenG: dto.nutrition.saturatedFatG,
          kohlenhydrateG: dto.nutrition.carbsG,
          zuckerG: dto.nutrition.sugarG,
          ballaststoffeG: dto.nutrition.fiberG,
          eiweissG: dto.nutrition.proteinG,
          salzG: dto.nutrition.saltG,
          alkoholG: dto.nutrition.alcoholG,
        }
      : undefined,
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
    reductionFactor: input.reduktionsfaktor || 1,
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

// ---- Rezeptrechner-Import (Rezepte + die darin verwendeten Zutaten in einem Schritt) ----

export interface RezeptImportErgebnis {
  rezepteNeu: number;
  rezepteAktualisiert: number;
  zutatenNeu: number;
  zutatenAktualisiert: number;
  zutatenUebersprungenManuell: number;
  zutatenNaehrwerteAusRezeptUebernommen: number;
  allergeneAusListeUebernommen: number;
  hinweise: string[];
}

interface RecipeImportResultDto {
  recipesAdded: number;
  recipesUpdated: number;
  ingredientsAdded: number;
  ingredientsUpdated: number;
  ingredientsSkippedManuallyEdited: number;
  ingredientsNutritionFromRecipeMatch: number;
  allergensFromListApplied: number;
  warnings: { reason: string }[];
}

/** Nimmt die Rezeptrechner-Exportdateien entgegen ("Rezepte-Zutaten-Mengen" und
 * "Artikeldaten-Kennzeichnung", optional zusätzlich "Allergene-Liste") und legt/aktualisiert
 * Rezepte plus die darin referenzierten Zutaten in einem Rutsch an — siehe
 * RecipeHandler.ImportFromRezeptrechnerAsync. Bereits manuell bearbeitete Zutaten werden nie
 * überschrieben. Ist die Allergene-Liste dabei, ersetzt ihre strukturierte Zuordnung je Rezept die
 * aus der Artikeldaten-Freitextspalte geparsten Allergene (präziser, z. B. "Gluten/ Weizen" statt
 * nur "Gluten"). Die vierte mögliche Exportdatei (Preise-Wareneinsatz) wird nicht eingelesen: Preise
 * gehören auf die einzelne Zutat (Lieferantenpreise-Screen), nicht aufs Rezept — und der Export
 * enthält ohnehin nur Nullwerte, solange im Rezeptrechner keine Einkaufspreise hinterlegt sind. */
export function useImportRezeptrechner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      zutatenMengenFile,
      artikeldatenFile,
      allergeneListeFile,
    }: {
      zutatenMengenFile: File;
      artikeldatenFile: File;
      allergeneListeFile?: File;
    }): Promise<RezeptImportErgebnis> => {
      const files: Record<string, File> = { zutatenMengenFile, artikeldatenFile };
      if (allergeneListeFile) files.allergeneListeFile = allergeneListeFile;
      const result = await apiFetchUploadMulti<RecipeImportResultDto>("/recipes/import", files);
      return {
        rezepteNeu: result.recipesAdded,
        rezepteAktualisiert: result.recipesUpdated,
        zutatenNeu: result.ingredientsAdded,
        zutatenAktualisiert: result.ingredientsUpdated,
        zutatenUebersprungenManuell: result.ingredientsSkippedManuallyEdited,
        zutatenNaehrwerteAusRezeptUebernommen: result.ingredientsNutritionFromRecipeMatch,
        allergeneAusListeUebernommen: result.allergensFromListApplied,
        hinweise: result.warnings.map((w) => w.reason),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
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

// ---- Nährwerte-Detailansicht ("Nährwerte ansehen") ----

export interface RezeptNaehrwerteZeile {
  zutatId: string;
  name: string;
  menge: number;
  einheit: Einheit;
  gewichtG?: number;
  hatNaehrwerte: boolean;
  naehrwerte: RezeptNaehrwerte100;
}

export interface DiabetikerWerte {
  be: number;
  ke: number;
  fpe: number;
}

export interface NaehrwertAngabeAuswertung {
  text: string;
  messgroesse?: string;
  gemessenerWert?: string;
  schwelle?: string;
}

export interface RezeptNaehrwerteDetail {
  rohgewichtG: number;
  reduktionsfaktor: number;
  gewichtZubereitetG: number;
  standardPortionen: number;
  gewichtProPortionG?: number;
  zutaten: RezeptNaehrwerteZeile[];
  proRezept?: RezeptNaehrwerte100;
  proPortion?: RezeptNaehrwerte100;
  pro100g?: RezeptNaehrwerte100;
  diabetikerProPortion?: DiabetikerWerte;
  diabetikerPro100g?: DiabetikerWerte;
  angaben: NaehrwertAngabeAuswertung[];
}

interface RecipeNutritionIngredientRowDto {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  weightG: number | null;
  hasNutritionData: boolean;
  nutrition: RecipeNutritionDto;
}

interface DiabeticUnitsDto {
  be: number;
  ke: number;
  fpe: number;
}

interface NutritionClaimEvaluationDto {
  claimText: string;
  measureLabel: string | null;
  measuredValue: string | null;
  threshold: string | null;
}

interface RecipeNutritionDetailDto {
  rawWeightG: number;
  reductionFactor: number;
  preparedWeightG: number;
  standardPortions: number;
  portionWeightG: number | null;
  ingredients: RecipeNutritionIngredientRowDto[];
  perRecipe: RecipeNutritionDto | null;
  perPortion: RecipeNutritionDto | null;
  per100g: RecipeNutritionDto | null;
  diabeticPerPortion: DiabeticUnitsDto | null;
  diabeticPer100g: DiabeticUnitsDto | null;
  claimEvaluations: NutritionClaimEvaluationDto[];
}

function toRezeptNaehrwerte100(n: RecipeNutritionDto): RezeptNaehrwerte100 {
  return {
    kcal: n.kcal, kj: n.kj, fettG: n.fatG, gesFettSaeurenG: n.saturatedFatG, kohlenhydrateG: n.carbsG,
    zuckerG: n.sugarG, ballaststoffeG: n.fiberG, eiweissG: n.proteinG, salzG: n.saltG, alkoholG: n.alcoholG,
  };
}

export function useRezeptNaehrwerteDetail(id: string | undefined): RezeptNaehrwerteDetail | undefined {
  const query = useQuery({
    queryKey: ["recipe-nutrition-detail", id],
    queryFn: () => api.get<RecipeNutritionDetailDto>(`/recipes/${id}/nutrition-detail`),
    enabled: !!id,
  });
  if (!query.data) return undefined;
  const d = query.data;
  return {
    rohgewichtG: d.rawWeightG,
    reduktionsfaktor: d.reductionFactor,
    gewichtZubereitetG: d.preparedWeightG,
    standardPortionen: d.standardPortions,
    gewichtProPortionG: d.portionWeightG ?? undefined,
    zutaten: d.ingredients.map((i) => ({
      zutatId: i.ingredientId,
      name: i.ingredientName,
      menge: i.quantity,
      einheit: unitToFrontend(i.unit),
      gewichtG: i.weightG ?? undefined,
      hatNaehrwerte: i.hasNutritionData,
      naehrwerte: toRezeptNaehrwerte100(i.nutrition),
    })),
    proRezept: d.perRecipe ? toRezeptNaehrwerte100(d.perRecipe) : undefined,
    proPortion: d.perPortion ? toRezeptNaehrwerte100(d.perPortion) : undefined,
    pro100g: d.per100g ? toRezeptNaehrwerte100(d.per100g) : undefined,
    diabetikerProPortion: d.diabeticPerPortion ?? undefined,
    diabetikerPro100g: d.diabeticPer100g ?? undefined,
    angaben: d.claimEvaluations.map((c) => ({
      text: c.claimText,
      messgroesse: c.measureLabel ?? undefined,
      gemessenerWert: c.measuredValue ?? undefined,
      schwelle: c.threshold ?? undefined,
    })),
  };
}

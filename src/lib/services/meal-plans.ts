import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Speiseplan, SpeiseplanStatus, SpeiseplanGericht, Menuelinie } from "@/features/meal-plans/types";

export type { Speiseplan, SpeiseplanTag, SpeiseplanGericht, Menuelinie, SpeiseplanStatus } from "@/features/meal-plans/types";
export { MENUELINIEN } from "@/features/meal-plans/types";

const dietLineToFrontend: Record<string, Menuelinie> = {
  NORMALKOST: "Normalkost",
  VEGGIE: "Veggie",
  GLUTENFREI_LAKTOSEFREI: "Glutenfrei-Laktosefrei",
  ALTERNATIV: "Alternativ",
};
const dietLineToBackend: Record<Menuelinie, string> = {
  "Normalkost": "NORMALKOST",
  "Veggie": "VEGGIE",
  "Glutenfrei-Laktosefrei": "GLUTENFREI_LAKTOSEFREI",
  "Alternativ": "ALTERNATIV",
};

interface MealPlanItemDto {
  id: string;
  recipeId: string;
  recipeName: string;
  dietLine: string;
}

interface MealPlanDayDto {
  id: string;
  weekday: string;
  date: string;
  note: string | null;
  items: MealPlanItemDto[];
}

interface MealPlanDto {
  id: string;
  calendarWeek: number;
  year: number;
  status: string;
  isTemplate: boolean;
  templateSlot: number | null;
  locationIds: string[];
  facilityIds: string[];
  days: MealPlanDayDto[];
}

function toSpeiseplan(dto: MealPlanDto): Speiseplan {
  return {
    id: dto.id,
    kalenderwoche: dto.calendarWeek,
    jahr: dto.year,
    status: dto.status as SpeiseplanStatus,
    standortIds: dto.locationIds,
    einrichtungIds: dto.facilityIds,
    istVorlage: dto.isTemplate,
    vorlagenSlot: dto.templateSlot ?? undefined,
    tage: dto.days.map((d) => ({
      id: d.id,
      wochentag: d.weekday,
      datum: d.date,
      gerichte: d.items.map((i) => ({ rezeptId: i.recipeId, menuelinie: dietLineToFrontend[i.dietLine] ?? "Normalkost" })),
      hinweis: d.note ?? undefined,
    })),
  };
}

export function useSpeiseplaene(filters?: { jahr?: number; kalenderwoche?: number; status?: SpeiseplanStatus }): Speiseplan[] {
  const query = useQuery({
    queryKey: ["meal-plans", filters],
    queryFn: () =>
      api.get<PagedResult<MealPlanDto>>(
        `/meal-plans${toQueryString({ year: filters?.jahr, calendarWeek: filters?.kalenderwoche, status: filters?.status, pageSize: 200 })}`
      ),
  });
  return (query.data?.items ?? []).map(toSpeiseplan);
}

/** Die bis zu 8 wiederverwendbaren Grundwochen ("Vorlage 1-8"). */
export function useMealPlanTemplates(): Speiseplan[] {
  const query = useQuery({ queryKey: ["meal-plan-templates"], queryFn: () => api.get<PagedResult<MealPlanDto>>("/meal-plans/templates?pageSize=8") });
  return (query.data?.items ?? []).map(toSpeiseplan);
}

/** Für Portal-Nutzer: nur veröffentlichte/geschlossene/archivierte Pläne der eigenen Einrichtung. */
export function usePortalSpeiseplaene(): Speiseplan[] {
  const query = useQuery({ queryKey: ["portal-meal-plans"], queryFn: () => api.get<MealPlanDto[]>("/portal/meal-plans") });
  return (query.data ?? []).map(toSpeiseplan);
}

export function useCreateSpeiseplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { kalenderwoche: number; jahr: number; standortIds: string[]; einrichtungIds: string[]; istVorlage?: boolean; vorlagenSlot?: number }) =>
      api.post<MealPlanDto>("/meal-plans", {
        calendarWeek: input.kalenderwoche,
        year: input.jahr,
        locationIds: input.standortIds,
        facilityIds: input.einrichtungIds,
        isTemplate: input.istVorlage ?? false,
        templateSlot: input.vorlagenSlot ?? null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

export function useDuplicateSpeiseplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<MealPlanDto>(`/meal-plans/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

/** Dupliziert eine Vorlage (oder eine beliebige andere Woche) gezielt in eine Kalenderwoche —
 * ersetzt das Rätselraten "welche KW-Nummer war das nochmal", das mit dem einfachen Duplizieren
 * (immer die Folgewoche) sonst nötig wäre. */
export function useDuplicateIntoWeek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, zielJahr, zielKalenderwoche }: { id: string; zielJahr: number; zielKalenderwoche: number }) =>
      api.post<MealPlanDto>(`/meal-plans/${id}/duplicate-into-week`, { targetYear: zielJahr, targetCalendarWeek: zielKalenderwoche }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

/** Nur solange der Plan noch Entwurf ist — z. B. um eine versehentlich duplizierte Woche wieder zu entfernen. */
export function useDeleteSpeiseplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/meal-plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

/** Setzt die Gerichte (inkl. Menülinie) eines Plantags — sendet nur diesen einen Tag im PUT. */
export function useUpdateSpeiseplanTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, tagId, gerichte, hinweis }: { plan: Speiseplan; tagId: string; gerichte: SpeiseplanGericht[]; hinweis?: string }) =>
      api.put<MealPlanDto>(`/meal-plans/${plan.id}`, {
        locationIds: plan.standortIds,
        facilityIds: plan.einrichtungIds,
        days: [{ dayId: tagId, items: gerichte.map((g) => ({ recipeId: g.rezeptId, dietLine: dietLineToBackend[g.menuelinie] })), note: hinweis }],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

function useTransition(action: "submit-review" | "publish" | "unpublish" | "archive") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<MealPlanDto>(`/meal-plans/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });
}

export const useSubmitReviewSpeiseplan = () => useTransition("submit-review");
export const usePublishSpeiseplan = () => useTransition("publish");
export const useUnpublishSpeiseplan = () => useTransition("unpublish");
export const useArchiveSpeiseplan = () => useTransition("archive");

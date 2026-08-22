import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Speiseplan, SpeiseplanStatus } from "@/features/meal-plans/types";

export type { Speiseplan, SpeiseplanTag, SpeiseplanStatus } from "@/features/meal-plans/types";

interface MealPlanItemDto {
  id: string;
  recipeId: string;
  recipeName: string;
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
    tage: dto.days.map((d) => ({
      id: d.id,
      wochentag: d.weekday,
      datum: d.date,
      rezeptIds: d.items.map((i) => i.recipeId),
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

/** Für Portal-Nutzer: nur veröffentlichte/geschlossene/archivierte Pläne der eigenen Einrichtung. */
export function usePortalSpeiseplaene(): Speiseplan[] {
  const query = useQuery({ queryKey: ["portal-meal-plans"], queryFn: () => api.get<MealPlanDto[]>("/portal/meal-plans") });
  return (query.data ?? []).map(toSpeiseplan);
}

export function useCreateSpeiseplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { kalenderwoche: number; jahr: number; standortIds: string[]; einrichtungIds: string[] }) =>
      api.post<MealPlanDto>("/meal-plans", {
        calendarWeek: input.kalenderwoche,
        year: input.jahr,
        locationIds: input.standortIds,
        facilityIds: input.einrichtungIds,
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

/** Fügt ein Rezept zu einem Plantag hinzu oder entfernt es — sendet nur diesen einen Tag im PUT. */
export function useUpdateSpeiseplanTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, tagId, rezeptIds, hinweis }: { plan: Speiseplan; tagId: string; rezeptIds: string[]; hinweis?: string }) =>
      api.put<MealPlanDto>(`/meal-plans/${plan.id}`, {
        locationIds: plan.standortIds,
        facilityIds: plan.einrichtungIds,
        days: [{ dayId: tagId, recipeIds: rezeptIds, note: hinweis }],
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

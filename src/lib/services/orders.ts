import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Bestellung, BestellPosition, BestellStatus } from "@/lib/types";

interface OrderItemDto {
  id: string;
  date: string;
  recipeId: string;
  recipeName: string;
  portions: number;
  note: string | null;
}

interface OrderDto {
  id: string;
  facilityId: string;
  facilityName: string;
  mealPlanId: string;
  calendarWeek: number;
  year: number;
  status: string;
  submittedAt: string | null;
  deadlineAtUtc: string;
  items: OrderItemDto[];
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function toBestellung(dto: OrderDto): Bestellung {
  return {
    id: dto.id,
    einrichtungId: dto.facilityId,
    speiseplanId: dto.mealPlanId,
    status: dto.status as BestellStatus,
    positionen: dto.items.map((i) => ({ id: i.id, datum: i.date, rezeptId: i.recipeId, portionen: i.portions, hinweis: i.note ?? undefined })),
    abgesendetAm: dto.submittedAt ? formatDateTime(dto.submittedAt) : undefined,
    frist: formatDateTime(dto.deadlineAtUtc),
  };
}

export function useBestellungen(filters?: { einrichtungId?: string; speiseplanId?: string; kalenderwoche?: number; status?: BestellStatus }): Bestellung[] {
  const query = useQuery({
    queryKey: ["orders", filters],
    queryFn: () =>
      api.get<PagedResult<OrderDto>>(
        `/orders${toQueryString({ facilityId: filters?.einrichtungId, mealPlanId: filters?.speiseplanId, calendarWeek: filters?.kalenderwoche, status: filters?.status, pageSize: 500 })}`
      ),
  });
  return (query.data?.items ?? []).map(toBestellung);
}

export function useSaveBestellung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { speiseplanId: string; positionen: BestellPosition[]; submit: boolean }) =>
      api.post<OrderDto>("/orders", {
        mealPlanId: input.speiseplanId,
        items: input.positionen.map((p) => ({ date: p.datum, recipeId: p.rezeptId, portions: p.portionen, note: p.hinweis })),
        submit: input.submit,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

function useOrderAction(action: "submit" | "confirm" | "lock") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<OrderDto>(`/orders/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export const useSubmitBestellung = () => useOrderAction("submit");
export const useConfirmBestellung = () => useOrderAction("confirm");
export const useLockBestellung = () => useOrderAction("lock");

export interface AnpassungPosition {
  positionId: string;
  portionen: number;
  hinweis: string;
}

/** Anpassung am Liefertag selbst — nur Reduzieren möglich, nie erhöhen oder neu hinzufügen, bis zur
 * tagesaktuellen Frist (Standard 9 Uhr, siehe TenantSettings.SameDayAdjustmentDeadlineTime). */
export function useAdjustBestellungSameDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, positionen }: { id: string; positionen: AnpassungPosition[] }) =>
      api.put<OrderDto>(`/orders/${id}/adjust`, { items: positionen.map((p) => ({ itemId: p.positionId, portions: p.portionen, note: p.hinweis })) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useOverrideBestellung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post<OrderDto>(`/orders/${id}/override`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

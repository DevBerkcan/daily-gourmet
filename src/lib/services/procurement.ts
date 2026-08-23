import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiFetchBlob, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { Einheit } from "@/lib/types";
import { unitToFrontend } from "./ingredients";

export type EinkaufslistenStatus = "DRAFT" | "REVIEWED" | "READY_FOR_APPROVAL" | "APPROVED" | "ORDERED" | "COMPLETED";

export interface EinkaufslistenPosition {
  id: string;
  zutatId: string;
  zutatName: string;
  artikelnummer: string;
  kategorie: string;
  lieferant?: string;
  einheit: Einheit;
  gesamtmengeBasis: number;
  einkaufsmenge: number;
}

export interface Einkaufsliste {
  id: string;
  bezeichnung: string;
  kalenderwoche: number;
  standortId: string;
  standortName: string;
  /** Jede Liste gehört zu genau einem Lieferanten ("pro Einkaufsliste ein Lieferant") — undefined
   * nur für die Sammelliste ohne bekannten Lieferantenpreis. */
  lieferantId?: string;
  lieferantName?: string;
  status: EinkaufslistenStatus;
  positionen: EinkaufslistenPosition[];
}

interface ProcurementListItemDto {
  id: string;
  ingredientId: string;
  ingredientName: string;
  ingredientArticleNumber: string;
  categoryName: string;
  supplierName: string | null;
  unit: string;
  totalQuantityBase: number;
  purchaseQuantity: number;
}

interface ProcurementListDto {
  id: string;
  label: string;
  calendarWeek: number;
  locationId: string;
  locationName: string;
  supplierId: string | null;
  supplierName: string | null;
  status: string;
  items: ProcurementListItemDto[];
}

function toEinkaufsliste(dto: ProcurementListDto): Einkaufsliste {
  return {
    id: dto.id,
    bezeichnung: dto.label,
    kalenderwoche: dto.calendarWeek,
    standortId: dto.locationId,
    standortName: dto.locationName,
    lieferantId: dto.supplierId ?? undefined,
    lieferantName: dto.supplierName ?? undefined,
    status: dto.status as EinkaufslistenStatus,
    positionen: dto.items.map((i) => ({
      id: i.id,
      zutatId: i.ingredientId,
      zutatName: i.ingredientName,
      artikelnummer: i.ingredientArticleNumber,
      kategorie: i.categoryName,
      lieferant: i.supplierName ?? undefined,
      einheit: unitToFrontend(i.unit),
      gesamtmengeBasis: i.totalQuantityBase,
      einkaufsmenge: i.purchaseQuantity,
    })),
  };
}

export function useEinkaufslisten(filters?: { standortId?: string; kalenderwoche?: number; status?: EinkaufslistenStatus }): Einkaufsliste[] {
  const query = useQuery({
    queryKey: ["procurement-lists", filters],
    queryFn: () =>
      api.get<PagedResult<ProcurementListDto>>(
        `/procurement-lists${toQueryString({ locationId: filters?.standortId, calendarWeek: filters?.kalenderwoche, status: filters?.status, pageSize: 100 })}`
      ),
  });
  return (query.data?.items ?? []).map(toEinkaufsliste);
}

export function useGenerateEinkaufsliste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { produktionsplanId: string; standortId: string; kalenderwoche: number; bezeichnung: string }) =>
      api.post<ProcurementListDto>("/procurement-lists/generate", {
        productionPlanId: input.produktionsplanId,
        locationId: input.standortId,
        calendarWeek: input.kalenderwoche,
        label: input.bezeichnung,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procurement-lists"] }),
  });
}

export function useUpdateEinkaufsmenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listeId, positionId, menge }: { listeId: string; positionId: string; menge: number }) =>
      api.put<ProcurementListDto>(`/procurement-lists/${listeId}/items/${positionId}`, { purchaseQuantity: menge }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procurement-lists"] }),
  });
}

export function useUpdateEinkaufslistenStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EinkaufslistenStatus }) => api.put<ProcurementListDto>(`/procurement-lists/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["procurement-lists"] }),
  });
}

export async function exportEinkaufsliste(id: string, format: "csv" | "pdf", dateiname: string) {
  const blob = await apiFetchBlob(`/procurement-lists/${id}/export?format=${format}`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dateiname;
  link.click();
  URL.revokeObjectURL(url);
}

/** Token-Freigabe aus der E-Mail — funktioniert ohne Login, siehe
 * ProcurementListHandler.ApproveAsync auf dem Backend. */
export function useApproveEinkaufsliste() {
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => api.post<ProcurementListDto>(`/procurement-lists/${id}/approve?token=${encodeURIComponent(token)}`),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export interface AdminDashboardSummary {
  bestellungenDieseWoche: number;
  verbindlicheBestellungen: number;
  portionenHeute: number;
  einrichtungenOhneBestellung: number;
  naechsteWocheSpeiseplanStatus?: string;
}

interface AdminDashboardSummaryDto {
  thisWeekOrderCount: number;
  thisWeekBindingOrderCount: number;
  todayTotalPortions: number;
  facilitiesWithoutOrderCount: number;
  nextWeekMealPlanStatus: string | null;
}

export function useAdminDashboardSummary(): AdminDashboardSummary | undefined {
  const query = useQuery({ queryKey: ["admin-dashboard-summary"], queryFn: () => api.get<AdminDashboardSummaryDto>("/dashboard/admin-summary") });
  if (!query.data) return undefined;
  const dto = query.data;
  return {
    bestellungenDieseWoche: dto.thisWeekOrderCount,
    verbindlicheBestellungen: dto.thisWeekBindingOrderCount,
    portionenHeute: dto.todayTotalPortions,
    einrichtungenOhneBestellung: dto.facilitiesWithoutOrderCount,
    naechsteWocheSpeiseplanStatus: dto.nextWeekMealPlanStatus ?? undefined,
  };
}

export interface PortalDashboardSummary {
  aktuelleVeroeffentlichteWoche?: string;
  naechsteFrist?: string;
  bestellstatusAktuelleWoche?: string;
}

interface PortalDashboardSummaryDto {
  currentPublishedWeekLabel: string | null;
  nextDeadlineUtc: string | null;
  currentWeekOrderStatus: string | null;
}

export function usePortalDashboardSummary(): PortalDashboardSummary | undefined {
  const query = useQuery({ queryKey: ["portal-dashboard-summary"], queryFn: () => api.get<PortalDashboardSummaryDto>("/dashboard/portal-summary") });
  if (!query.data) return undefined;
  const dto = query.data;
  return {
    aktuelleVeroeffentlichteWoche: dto.currentPublishedWeekLabel ?? undefined,
    naechsteFrist: dto.nextDeadlineUtc ? new Date(dto.nextDeadlineUtc).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : undefined,
    bestellstatusAktuelleWoche: dto.currentWeekOrderStatus ?? undefined,
  };
}

export interface Benachrichtigung {
  id: string;
  titel: string;
  text: string;
  gelesen: boolean;
  zeitpunkt: string;
}

interface NotificationDto {
  id: string;
  title: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export function useBenachrichtigungen(): Benachrichtigung[] {
  const query = useQuery({ queryKey: ["notifications"], queryFn: () => api.get<PagedResult<NotificationDto>>("/notifications?pageSize=20") });
  return (query.data?.items ?? []).map((n) => ({
    id: n.id,
    titel: n.title,
    text: n.text,
    gelesen: n.isRead,
    zeitpunkt: new Date(n.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
  }));
}

export function useMarkiereBenachrichtigungGelesen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export interface WochenUmsatz {
  jahr: number;
  kalenderwoche: number;
  umsatz: number;
  portionen: number;
  einrichtungenAnzahl: number;
}

export interface BestellungsUmsatz {
  bestellungId: string;
  jahr: number;
  kalenderwoche: number;
  einrichtungName: string;
  standortName: string;
  portionen: number;
  portionspreis: number;
  umsatz: number;
}

interface WeeklyRevenueDto {
  year: number;
  calendarWeek: number;
  totalRevenue: number;
  totalPortions: number;
  facilityCount: number;
}

interface OrderRevenueDto {
  orderId: string;
  year: number;
  calendarWeek: number;
  facilityName: string;
  locationName: string;
  portions: number;
  portionPrice: number;
  revenue: number;
}

interface RevenueResponseDto {
  weeklyTotals: WeeklyRevenueDto[];
  orderDetails: OrderRevenueDto[];
}

export function useRevenue(filters?: { von?: Date; bis?: Date }): { woechentlich: WochenUmsatz[]; bestellungen: BestellungsUmsatz[] } {
  const query = useQuery({
    queryKey: ["revenue", filters],
    queryFn: () => api.get<RevenueResponseDto>(`/revenue${toQueryString({ from: filters?.von?.toISOString(), to: filters?.bis?.toISOString() })}`),
  });
  return {
    woechentlich: (query.data?.weeklyTotals ?? []).map((w) => ({ jahr: w.year, kalenderwoche: w.calendarWeek, umsatz: w.totalRevenue, portionen: w.totalPortions, einrichtungenAnzahl: w.facilityCount })),
    bestellungen: (query.data?.orderDetails ?? []).map((o) => ({
      bestellungId: o.orderId, jahr: o.year, kalenderwoche: o.calendarWeek, einrichtungName: o.facilityName, standortName: o.locationName,
      portionen: o.portions, portionspreis: o.portionPrice, umsatz: o.revenue,
    })),
  };
}

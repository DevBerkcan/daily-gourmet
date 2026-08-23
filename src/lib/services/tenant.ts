import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export interface CurrentTenant {
  name: string;
  ansprechpartner: string;
  email: string;
}

interface TenantDto {
  id: string;
  name: string;
  status: string;
  mainContactName: string;
  mainContactEmail: string;
  createdAt: string;
  userCount: number;
  facilityCount: number;
}

export function useCurrentTenant(): CurrentTenant | undefined {
  const query = useQuery({ queryKey: ["current-tenant"], queryFn: () => api.get<TenantDto>("/tenants/current") });
  if (!query.data) return undefined;
  return { name: query.data.name, ansprechpartner: query.data.mainContactName, email: query.data.mainContactEmail };
}

export function useUpdateCurrentTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CurrentTenant) => api.put<TenantDto>("/tenants/current", { name: input.name, mainContactName: input.ansprechpartner, mainContactEmail: input.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["current-tenant"] }),
  });
}

export interface TenantSettings {
  bestellfristTageVorher: number;
  bestellfristUhrzeit: string;
  sameDayAnpassungFrist: string;
  wochenendenAusschliessen: boolean;
  pruefungVorVeroeffentlichung: boolean;
  zurueckziehenNurOhneBestellungen: boolean;
  praefixEinrichtungen: string;
  praefixArtikel: string;
  praefixTouren: string;
  benachrichtigungen: { eventKey: string; aktiv: boolean }[];
}

interface TenantSettingsDto {
  defaultOrderDeadlineOffsetDays: number;
  defaultOrderDeadlineTime: string;
  sameDayAdjustmentDeadlineTime: string;
  excludeWeekendsFromDeadline: boolean;
  requireReviewBeforePublish: boolean;
  unpublishRequiresNoOrders: boolean;
  facilityNumberPrefix: string;
  articleNumberPrefix: string;
  routeNumberPrefix: string;
  notificationSettings: { eventKey: string; enabled: boolean }[];
}

function toTenantSettings(dto: TenantSettingsDto): TenantSettings {
  return {
    bestellfristTageVorher: dto.defaultOrderDeadlineOffsetDays,
    bestellfristUhrzeit: dto.defaultOrderDeadlineTime.slice(0, 5),
    sameDayAnpassungFrist: dto.sameDayAdjustmentDeadlineTime.slice(0, 5),
    wochenendenAusschliessen: dto.excludeWeekendsFromDeadline,
    pruefungVorVeroeffentlichung: dto.requireReviewBeforePublish,
    zurueckziehenNurOhneBestellungen: dto.unpublishRequiresNoOrders,
    praefixEinrichtungen: dto.facilityNumberPrefix,
    praefixArtikel: dto.articleNumberPrefix,
    praefixTouren: dto.routeNumberPrefix,
    benachrichtigungen: dto.notificationSettings.map((n) => ({ eventKey: n.eventKey, aktiv: n.enabled })),
  };
}

export function useTenantSettings(): TenantSettings | undefined {
  const query = useQuery({ queryKey: ["tenant-settings"], queryFn: () => api.get<TenantSettingsDto>("/tenants/current/settings") });
  return query.data ? toTenantSettings(query.data) : undefined;
}

const NOTIFICATION_LABELS: Record<string, string> = {
  MealPlanPublished: "Speiseplan veröffentlicht → Einrichtungen",
  DeadlineApproaching: "Frist läuft ab → Einrichtungen ohne Bestellung",
  OrderChangedAfterSubmit: "Bestellung nachträglich geändert → Küche",
  ProductionPlanChanged: "Produktionsplan geändert → Kitchen Manager",
};
export const notificationLabel = (eventKey: string) => NOTIFICATION_LABELS[eventKey] ?? eventKey;

export interface TenantProfile {
  ustId?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
  zeitzone: string;
  waehrung: string;
  logoUrl?: string;
}

interface TenantProfileDto {
  vatId: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  logoUrl: string | null;
}

export function useTenantProfile(): TenantProfile | undefined {
  const query = useQuery({ queryKey: ["tenant-profile"], queryFn: () => api.get<TenantProfileDto>("/tenants/current/profile") });
  if (!query.data) return undefined;
  const dto = query.data;
  return {
    ustId: dto.vatId ?? undefined,
    strasse: dto.street ?? undefined,
    plz: dto.postalCode ?? undefined,
    ort: dto.city ?? undefined,
    telefon: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    zeitzone: dto.timezone,
    waehrung: dto.currency,
    logoUrl: dto.logoUrl ?? undefined,
  };
}

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantProfile) =>
      api.put<TenantProfileDto>("/tenants/current/profile", {
        vatId: input.ustId || null,
        street: input.strasse || null,
        postalCode: input.plz || null,
        city: input.ort || null,
        phone: input.telefon || null,
        email: input.email || null,
        timezone: input.zeitzone,
        currency: input.waehrung,
        logoUrl: input.logoUrl || null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-profile"] }),
  });
}

export interface AuditEintrag {
  id: string;
  zeitpunkt: string;
  benutzer: string;
  aktion: string;
  entitaet: string;
  entitaetId: string;
  begruendung?: string;
}

interface AuditLogDto {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  reason: string | null;
  userName: string;
  createdAtUtc: string;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function useAuditLog(filters?: { action?: string; entity?: string }): AuditEintrag[] {
  const query = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => api.get<PagedResult<AuditLogDto>>(`/audit-logs${toQueryString({ ...filters, pageSize: 200 })}`),
  });
  return (query.data?.items ?? []).map((a) => ({
    id: a.id,
    zeitpunkt: formatDateTime(a.createdAtUtc),
    benutzer: a.userName,
    aktion: a.action,
    entitaet: a.entity,
    entitaetId: a.entityId,
    begruendung: a.reason ?? undefined,
  }));
}

import { useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

/** Unternehmensprofil und Einstellungen eines Mandanten werden ausschließlich von Daily Gourmet
 * (Super Admin) gepflegt — siehe useTenantProfile/useTenantSettings in @/lib/services/super-admin,
 * die dieselben Datenformen tenantId-parametrisiert unter /super-admin/tenants/{id}/... anbieten. */

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

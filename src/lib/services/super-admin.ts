import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { TenantStatus } from "@/features/tenants/types";

export type { TenantStatus } from "@/features/tenants/types";

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  ansprechpartner: string;
  email: string;
  erstelltAm: string;
  benutzerAnzahl: number;
  einrichtungenAnzahl: number;
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

function toTenant(dto: TenantDto): Tenant {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status as TenantStatus,
    ansprechpartner: dto.mainContactName,
    email: dto.mainContactEmail,
    erstelltAm: dto.createdAt,
    benutzerAnzahl: dto.userCount,
    einrichtungenAnzahl: dto.facilityCount,
  };
}

export function useTenants(): Tenant[] {
  const query = useQuery({ queryKey: ["super-admin-tenants"], queryFn: () => api.get<PagedResult<TenantDto>>("/super-admin/tenants?pageSize=200") });
  return (query.data?.items ?? []).map(toTenant);
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; ansprechpartner: string; email: string }) =>
      api.post<TenantDto>("/super-admin/tenants", { name: input.name, mainContactName: input.ansprechpartner, mainContactEmail: input.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["super-admin-tenants"] }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name: string; ansprechpartner: string; email: string } }) =>
      api.put<TenantDto>(`/super-admin/tenants/${id}`, { name: input.name, mainContactName: input.ansprechpartner, mainContactEmail: input.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["super-admin-tenants"] }),
  });
}

function useTenantStatusAction(action: "lock" | "unlock" | "archive") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, grund }: { id: string; grund: string }) => api.post<TenantDto>(`/super-admin/tenants/${id}/${action}`, { reason: grund }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["super-admin-tenants"] }),
  });
}

export const useLockTenant = () => useTenantStatusAction("lock");
export const useUnlockTenant = () => useTenantStatusAction("unlock");
export const useArchiveTenant = () => useTenantStatusAction("archive");

export interface GlobalUser {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  facilityId: string | null;
  facilityName: string | null;
  name: string;
  email: string;
  rolle: string;
  status: string;
  letzteAnmeldung: string | null;
  fehlgeschlageneLogins: number;
}

interface UserDto {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  facilityId: string | null;
  facilityName: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  failedLoginCount: number;
}

const toGlobalUser = (dto: UserDto): GlobalUser => ({
  id: dto.id,
  tenantId: dto.tenantId,
  tenantName: dto.tenantName,
  facilityId: dto.facilityId,
  facilityName: dto.facilityName,
  name: dto.name,
  email: dto.email,
  rolle: dto.role,
  status: dto.status,
  letzteAnmeldung: dto.lastLoginAt,
  fehlgeschlageneLogins: dto.failedLoginCount,
});

export function useGlobalUsers(filters?: { tenantId?: string; role?: string; status?: string }): GlobalUser[] {
  const query = useQuery({
    queryKey: ["super-admin-users", filters],
    queryFn: () => api.get<PagedResult<UserDto>>(`/super-admin/users${toQueryString({ ...filters, pageSize: 500 })}`),
  });
  return (query.data?.items ?? []).map(toGlobalUser);
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; role: string; tenantId?: string }) =>
      api.post<UserDto>("/super-admin/users", { name: input.name, email: input.email, role: input.role, tenantId: input.tenantId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-tenants"] });
    },
  });
}

export function useTenantUsers(tenantId: string): GlobalUser[] {
  const query = useQuery({
    queryKey: ["super-admin-tenant-users", tenantId],
    queryFn: () => api.get<UserDto[]>(`/super-admin/tenants/${tenantId}/users`),
    enabled: !!tenantId,
  });
  return (query.data ?? []).map(toGlobalUser);
}

export interface SuperAdminDashboard {
  tenantCountsByStatus: Record<string, number>;
  totalUsers: number;
  activeUsersLast7Days: number;
  totalFacilities: number;
  thisWeekOrderCount: number;
  failedLoginsLast24h: number;
}

export function useSuperAdminDashboard(): SuperAdminDashboard | undefined {
  const query = useQuery({ queryKey: ["super-admin-dashboard"], queryFn: () => api.get<SuperAdminDashboard>("/super-admin/dashboard") });
  return query.data;
}

export interface SystemStatus {
  databaseConnected: boolean;
  version: string;
  backgroundJobs: string;
}

export function useSystemStatus(): SystemStatus | undefined {
  const query = useQuery({ queryKey: ["super-admin-system"], queryFn: () => api.get<SystemStatus>("/super-admin/system") });
  return query.data;
}

export interface LocationSummary {
  id: string;
  name: string;
  tenantName: string;
}

export function useAllLocations(): LocationSummary[] {
  const query = useQuery({ queryKey: ["super-admin-locations"], queryFn: () => api.get<LocationSummary[]>("/super-admin/locations") });
  return query.data ?? [];
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  standardAktiv: boolean;
}

interface FeatureFlagDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  defaultEnabled: boolean;
  tenantEnabled: boolean | null;
}

export function useFeatureFlags(): FeatureFlag[] {
  const query = useQuery({ queryKey: ["feature-flags"], queryFn: () => api.get<FeatureFlagDto[]>("/super-admin/feature-flags") });
  return (query.data ?? []).map((f) => ({ id: f.id, key: f.key, name: f.name, description: f.description ?? undefined, standardAktiv: f.defaultEnabled }));
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description, standardAktiv }: { id: string; name: string; description?: string; standardAktiv: boolean }) =>
      api.put<FeatureFlagDto>(`/super-admin/feature-flags/${id}`, { name, description, defaultEnabled: standardAktiv }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feature-flags"] }),
  });
}

export interface GlobalAuditEintrag {
  id: string;
  zeitpunkt: string;
  tenantName?: string;
  benutzer: string;
  aktion: string;
  entitaet: string;
  entitaetId: string;
  begruendung?: string;
}

interface GlobalAuditLogDto {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  reason: string | null;
  userName: string;
  tenantName: string | null;
  createdAtUtc: string;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function useGlobalAuditLog(filters?: { tenantId?: string }): GlobalAuditEintrag[] {
  const query = useQuery({
    queryKey: ["super-admin-audit-logs", filters],
    queryFn: () => api.get<PagedResult<GlobalAuditLogDto>>(`/super-admin/audit-logs${toQueryString({ tenantId: filters?.tenantId, pageSize: 200 })}`),
  });
  return (query.data?.items ?? []).map((a) => ({
    id: a.id,
    zeitpunkt: formatDateTime(a.createdAtUtc),
    tenantName: a.tenantName ?? undefined,
    benutzer: a.userName,
    aktion: a.action,
    entitaet: a.entity,
    entitaetId: a.entityId,
    begruendung: a.reason ?? undefined,
  }));
}

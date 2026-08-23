import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiFetchUpload, toQueryString } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";
import type { SupportKategorie, SupportPrioritaet, SupportStatus } from "@/features/support/types";

export type { SupportKategorie, SupportPrioritaet, SupportStatus } from "@/features/support/types";

export interface SupportAntwort {
  id: string;
  autor: string;
  rolle: "SUPER_ADMIN" | "TENANT_OWNER";
  text: string;
  zeitpunkt: string;
}

export interface SupportAnhang {
  id: string;
  dateiname: string;
  contentType: string;
  groesseBytes: number;
}

export interface SupportTicket {
  id: string;
  ticketNummer: string;
  tenantId: string;
  tenantName: string;
  erstelltVon: string;
  kategorie: SupportKategorie;
  prioritaet: SupportPrioritaet;
  titel: string;
  nachricht: string;
  seite?: string;
  status: SupportStatus;
  erstelltAm: string;
  antworten: SupportAntwort[];
  anhaenge: SupportAnhang[];
}

interface SupportTicketReplyDto {
  id: string;
  authorName: string;
  role: string;
  text: string;
  createdAt: string;
}

interface SupportTicketAttachmentDto {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

interface SupportTicketDto {
  id: string;
  tenantId: string;
  tenantName: string;
  ticketNumber: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  pageUrl: string | null;
  status: string;
  createdByUserName: string;
  createdAt: string;
  replies: SupportTicketReplyDto[];
  attachments: SupportTicketAttachmentDto[];
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function toSupportTicket(dto: SupportTicketDto): SupportTicket {
  return {
    id: dto.id,
    ticketNummer: dto.ticketNumber,
    tenantId: dto.tenantId,
    tenantName: dto.tenantName,
    erstelltVon: dto.createdByUserName,
    kategorie: dto.category as SupportKategorie,
    prioritaet: dto.priority as SupportPrioritaet,
    titel: dto.title,
    nachricht: dto.message,
    seite: dto.pageUrl ?? undefined,
    status: dto.status as SupportStatus,
    erstelltAm: formatDateTime(dto.createdAt),
    antworten: dto.replies.map((r) => ({ id: r.id, autor: r.authorName, rolle: r.role as SupportAntwort["rolle"], text: r.text, zeitpunkt: formatDateTime(r.createdAt) })),
    anhaenge: dto.attachments.map((a) => ({ id: a.id, dateiname: a.fileName, contentType: a.contentType, groesseBytes: a.sizeBytes })),
  };
}

export function useSupportTickets(status?: SupportStatus): SupportTicket[] {
  const query = useQuery({
    queryKey: ["support-tickets", status],
    queryFn: () => api.get<PagedResult<SupportTicketDto>>(`/support/tickets${toQueryString({ status, pageSize: 200 })}`),
  });
  return (query.data?.items ?? []).map(toSupportTicket);
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { kategorie: SupportKategorie; prioritaet: SupportPrioritaet; titel: string; nachricht: string; seite?: string }) =>
      api.post<SupportTicketDto>("/support/tickets", { category: input.kategorie, priority: input.prioritaet, title: input.titel, message: input.nachricht, pageUrl: input.seite }),
    onSuccess: (dto) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      return toSupportTicket(dto);
    },
  });
}

export function useAddSupportAntwort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => api.post<SupportTicketDto>(`/support/tickets/${id}/replies`, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] }),
  });
}

/** Manueller Datei-Upload (z. B. Screenshot) statt Live-Bildschirmaufnahme — es gibt aktuell keine
 * Capture-Bibliothek im Projekt, ein Upload-Feld deckt den gleichen Bedarf für den MVP ab. */
export function useUploadSupportAnhang() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) => apiFetchUpload<SupportTicketAttachmentDto>(`/support/tickets/${ticketId}/attachments`, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] }),
  });
}

export function useUpdateSupportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportStatus }) => api.put<SupportTicketDto>(`/support/tickets/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] }),
  });
}

/* ---------- Supportsitzungen (zeitlich begrenzter Supportzugriff) ---------- */

export interface SupportSitzung {
  id: string;
  tenantId: string;
  tenantName: string;
  gestartetVon: string;
  gestartetAm: string;
  endetUm: string;
}

interface SupportSessionDto {
  id: string;
  tenantId: string;
  tenantName: string;
  startedByUserName: string;
  startedAtUtc: string;
  expiresAtUtc: string;
  endedAtUtc: string | null;
  endedReason: string | null;
}

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

function toSupportSitzung(dto: SupportSessionDto): SupportSitzung {
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    tenantName: dto.tenantName,
    gestartetVon: dto.startedByUserName,
    gestartetAm: formatTime(dto.startedAtUtc),
    endetUm: formatTime(dto.expiresAtUtc),
  };
}

/** Aktive Supportsitzung des eigenen Mandanten (Tenant-Seite) — null, wenn keine läuft. */
export function useAktuelleSupportSitzung(): SupportSitzung | undefined {
  const query = useQuery({ queryKey: ["support-session-current"], queryFn: () => api.get<SupportSessionDto | null>("/support/session/current") });
  return query.data ? toSupportSitzung(query.data) : undefined;
}

/** Aktive Supportsitzung eines beliebigen Mandanten — Super-Admin-Sicht. */
export function useSupportSitzungFuerTenant(tenantId: string): SupportSitzung | undefined {
  const query = useQuery({
    queryKey: ["support-session-tenant", tenantId],
    queryFn: () => api.get<SupportSessionDto | null>(`/super-admin/tenants/${tenantId}/support-sessions/current`),
    enabled: !!tenantId,
  });
  return query.data ? toSupportSitzung(query.data) : undefined;
}

function invalidateSupportSessions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["support-session-current"] });
  queryClient.invalidateQueries({ queryKey: ["support-session-tenant"] });
}

export function useEndeSupportSitzung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/support/session/end"),
    onSuccess: () => invalidateSupportSessions(queryClient),
  });
}

/** Startet eine Supportsitzung für einen Mandanten (Super-Admin-Seite). */
export function useStarteSupportSitzung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => api.post<SupportSessionDto>(`/super-admin/tenants/${tenantId}/support-sessions`),
    onSuccess: () => invalidateSupportSessions(queryClient),
  });
}

/** Beendet eine Supportsitzung anhand ihrer Id (Super-Admin-Seite). */
export function useEndeSupportSitzungAlsSuperAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete(`/super-admin/support-sessions/${sessionId}`),
    onSuccess: () => invalidateSupportSessions(queryClient),
  });
}

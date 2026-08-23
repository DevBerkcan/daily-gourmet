import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export interface Einrichtung {
  id: string;
  name: string;
  kundennummer: string;
  anschrift: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  standortId: string;
  standortName: string;
  bestellfrist: string;
  aktiveWochentage: string[];
  portionspreis: number;
  status: "AKTIV" | "INAKTIV";
  notizen?: string;
  /** Stabile Standard-Tour, z. B. "RT1" (Nummernkreis, siehe Einstellungen) — Grundlage für die
   * Gruppierung im gedruckten Produktionsplan. */
  routeNummer?: string;
}

interface FacilityDto {
  id: string;
  name: string;
  customerNumber: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  locationId: string;
  locationName: string;
  activeWeekdays: string;
  portionPrice: number;
  status: string;
  notes: string | null;
  routeNumber: string | null;
}

export interface CreateEinrichtungInput {
  name: string;
  anschrift: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  standortId: string;
  aktiveWochentage: string[];
  portionspreis: number;
  notizen?: string;
  routeNummer?: string;
}

function toEinrichtung(dto: FacilityDto): Einrichtung {
  return {
    id: dto.id,
    name: dto.name,
    kundennummer: dto.customerNumber,
    anschrift: dto.address,
    ansprechpartner: dto.contactPerson,
    email: dto.email,
    telefon: dto.phone,
    standortId: dto.locationId,
    standortName: dto.locationName,
    // Der Backend-Bestellfrist-Wert ist strukturiert (TenantSettings-Standard oder
    // optionaler Override) statt Freitext — aktuell wird nur der Fallback angezeigt.
    bestellfrist: "Laut Mandanteneinstellungen",
    aktiveWochentage: dto.activeWeekdays.split(",").filter(Boolean),
    portionspreis: dto.portionPrice,
    status: dto.status as Einrichtung["status"],
    notizen: dto.notes ?? undefined,
    routeNummer: dto.routeNumber ?? undefined,
  };
}

export function useEinrichtungen() {
  const query = useQuery({
    queryKey: ["facilities"],
    queryFn: () => api.get<PagedResult<FacilityDto>>("/facilities?pageSize=200"),
  });
  return (query.data?.items ?? []).map(toEinrichtung);
}

/** Einzelne Einrichtung per Id — anders als /facilities (Liste) auch für Facility-Rollen erlaubt (eigene Einrichtung). */
export function useEinrichtung(id: string | null | undefined): Einrichtung | undefined {
  const query = useQuery({
    queryKey: ["facility", id],
    queryFn: () => api.get<FacilityDto>(`/facilities/${id}`),
    enabled: !!id,
  });
  return query.data ? toEinrichtung(query.data) : undefined;
}

export function useCreateEinrichtung() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEinrichtungInput) =>
      api.post<FacilityDto>("/facilities", {
        name: input.name,
        address: input.anschrift,
        contactPerson: input.ansprechpartner,
        email: input.email,
        phone: input.telefon,
        locationId: input.standortId,
        activeWeekdays: input.aktiveWochentage.join(","),
        portionPrice: input.portionspreis,
        notes: input.notizen,
        routeNumber: input.routeNummer,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

// ---- Schließtage/Abwesenheit ----

export interface EinrichtungSchliesstag {
  id: string;
  einrichtungId: string;
  von: string;
  bis: string;
  hinweis?: string;
  vonVerwaltungErfasst: boolean;
}

interface FacilityClosureDto {
  id: string;
  facilityId: string;
  startDate: string;
  endDate: string;
  note: string | null;
  addedByAdmin: boolean;
}

function toSchliesstag(dto: FacilityClosureDto): EinrichtungSchliesstag {
  return { id: dto.id, einrichtungId: dto.facilityId, von: dto.startDate, bis: dto.endDate, hinweis: dto.note ?? undefined, vonVerwaltungErfasst: dto.addedByAdmin };
}

/** Für Verwaltung: Schließtage einer beliebigen Einrichtung. */
export function useEinrichtungSchliesstage(facilityId: string | undefined): EinrichtungSchliesstag[] {
  const query = useQuery({
    queryKey: ["facility-closures", facilityId],
    queryFn: () => api.get<FacilityClosureDto[]>(`/facilities/${facilityId}/closures`),
    enabled: !!facilityId,
  });
  return (query.data ?? []).map(toSchliesstag);
}

export function useAddEinrichtungSchliesstag(facilityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { von: string; bis: string; hinweis?: string }) =>
      api.post<FacilityClosureDto>(`/facilities/${facilityId}/closures`, { startDate: input.von, endDate: input.bis, note: input.hinweis }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facility-closures", facilityId] }),
  });
}

export function useDeleteEinrichtungSchliesstag(facilityId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (closureId: string) => api.delete(`/facilities/${facilityId}/closures/${closureId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facility-closures", facilityId] }),
  });
}

/** Portal-Selbstbedienung: Schließtage der eigenen Einrichtung, ohne facilityId. */
export function usePortalSchliesstage(): EinrichtungSchliesstag[] {
  const query = useQuery({ queryKey: ["portal-facility-closures"], queryFn: () => api.get<FacilityClosureDto[]>("/portal/facility-closures") });
  return (query.data ?? []).map(toSchliesstag);
}

export function useAddPortalSchliesstag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { von: string; bis: string; hinweis?: string }) =>
      api.post<FacilityClosureDto>("/portal/facility-closures", { startDate: input.von, endDate: input.bis, note: input.hinweis }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portal-facility-closures"] }),
  });
}

export function useDeletePortalSchliesstag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (closureId: string) => api.delete(`/portal/facility-closures/${closureId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portal-facility-closures"] }),
  });
}

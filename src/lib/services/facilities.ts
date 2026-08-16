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
  };
}

export function useEinrichtungen() {
  const query = useQuery({
    queryKey: ["facilities"],
    queryFn: () => api.get<PagedResult<FacilityDto>>("/facilities?pageSize=200"),
  });
  return (query.data?.items ?? []).map(toEinrichtung);
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
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

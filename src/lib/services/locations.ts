import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export interface Standort {
  id: string;
  name: string;
  anschrift: string;
  kontaktperson: string;
  kapazitaetPortionen: number;
  status: "AKTIV" | "INAKTIV";
}

interface LocationDto {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  capacityPortions: number;
  status: string;
}

function toStandort(dto: LocationDto): Standort {
  return {
    id: dto.id,
    name: dto.name,
    anschrift: dto.address,
    kontaktperson: dto.contactPerson,
    kapazitaetPortionen: dto.capacityPortions,
    status: dto.status as Standort["status"],
  };
}

export function useStandorte() {
  const query = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.get<PagedResult<LocationDto>>("/locations?pageSize=100"),
  });
  return (query.data?.items ?? []).map(toStandort);
}

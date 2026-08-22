import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PagedResult } from "@/lib/api/types";

export interface Benutzer {
  id: string;
  name: string;
  email: string;
  rolle: string;
  status: string;
  facilityId: string | null;
}

interface UserDto {
  id: string;
  facilityId: string | null;
  facilityName: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
}

/** Benutzer des eigenen Mandanten — für FACILITY_ADMIN automatisch auf die eigene Einrichtung eingeschränkt (serverseitig). */
export function useUsers(): Benutzer[] {
  const query = useQuery({ queryKey: ["users"], queryFn: () => api.get<PagedResult<UserDto>>("/users?pageSize=200") });
  return (query.data?.items ?? []).map((u) => ({ id: u.id, name: u.name, email: u.email, rolle: u.role, status: u.status, facilityId: u.facilityId }));
}

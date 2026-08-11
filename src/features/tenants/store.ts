import { createStore } from "@/lib/store/create-store";
import { tenants as seedTenants } from "./data";
import type { Tenant, TenantStatus } from "./types";

const store = createStore<Tenant[]>(seedTenants.map((tenant) => ({ ...tenant })));

export function addTenant(input: { name: string; ansprechpartner: string; email: string }) {
  store.set((tenants) => [
    { id: `t-${Date.now()}`, name: input.name, status: "AKTIV", ansprechpartner: input.ansprechpartner, email: input.email, erstelltAm: new Date().toISOString().slice(0, 10), benutzerAnzahl: 1, einrichtungenAnzahl: 0, letzteAktivitaet: "gerade eben" },
    ...tenants,
  ]);
}

export function updateTenantStatus(id: string, status: TenantStatus) {
  store.set((tenants) => tenants.map((tenant) => (tenant.id === id ? { ...tenant, status } : tenant)));
}

export function updateTenant(id: string, input: Pick<Tenant, "name" | "ansprechpartner" | "email">) {
  store.set((tenants) => tenants.map((tenant) => (tenant.id === id ? { ...tenant, ...input } : tenant)));
}

export function useTenants(): Tenant[] {
  return store.useValue();
}

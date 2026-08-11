import { createStore } from "@/lib/store/create-store";
import { zutaten } from "./data";
import type { Zutat } from "./types";

/**
 * Session-Store für im Admin gepflegte Zutaten (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
const store = createStore<Zutat[]>(
  zutaten.map((z) => ({
    ...z,
    allergene: [...z.allergene],
    zusatzstoffe: [...z.zusatzstoffe],
    naehrwertePro100: { ...z.naehrwertePro100 },
  }))
);

export function addZutat(input: Omit<Zutat, "id">): Zutat {
  const neu: Zutat = { ...input, id: `z-${String(store.get().length + 1).padStart(3, "0")}` };
  store.set((alle) => [neu, ...alle]);
  return neu;
}

export function updateZutat(id: string, updates: Omit<Zutat, "id">) {
  store.set((alle) => alle.map((z) => (z.id === id ? { ...updates, id } : z)));
}

export function useZutaten(): Zutat[] {
  return store.useValue();
}

/** Nicht-reaktiver Lookup für Verwendung außerhalb von React-Komponenten. */
export function getZutatById(id: string): Zutat | undefined {
  return store.get().find((z) => z.id === id);
}

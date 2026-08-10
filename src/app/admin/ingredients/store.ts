import { useSyncExternalStore } from "react";
import { zutaten } from "@/lib/data";
import type { Zutat } from "@/lib/types";

/**
 * Session-Store für im Admin gepflegte Zutaten (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
let alle: Zutat[] = zutaten.map((z) => ({
  ...z,
  allergene: [...z.allergene],
  zusatzstoffe: [...z.zusatzstoffe],
  naehrwertePro100: { ...z.naehrwertePro100 },
}));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return alle;
}

export function addZutat(input: Omit<Zutat, "id">): Zutat {
  const neu: Zutat = { ...input, id: `z-${String(alle.length + 1).padStart(3, "0")}` };
  alle = [neu, ...alle];
  emit();
  return neu;
}

export function updateZutat(id: string, updates: Omit<Zutat, "id">) {
  alle = alle.map((z) => (z.id === id ? { ...updates, id } : z));
  emit();
}

export function useZutaten(): Zutat[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Nicht-reaktiver Lookup für Verwendung außerhalb von React-Komponenten. */
export function getZutatById(id: string): Zutat | undefined {
  return alle.find((z) => z.id === id);
}

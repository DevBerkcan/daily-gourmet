"use client";

import { createStore } from "./store/create-store";
import { einrichtungen as seedEinrichtungen } from "./data";
import type { Einrichtung } from "./types";

/**
 * Session-Store für im Admin gepflegte Einrichtungen (Client-only, kein Backend) — selbes Muster
 * wie die Feature-Stores unter features/*\/store.ts. Einrichtungen sind laut Architektur-Doku
 * Stammdaten, daher hier unter lib/ statt unter einem eigenen features/-Ordner.
 */
const store = createStore<Einrichtung[]>(
  seedEinrichtungen.map((e) => ({ ...e, aktiveWochentage: [...e.aktiveWochentage] }))
);

export function useEinrichtungen(): Einrichtung[] {
  return store.useValue();
}

export function addEinrichtung(input: Omit<Einrichtung, "id" | "kundennummer">): Einrichtung {
  const laufendeNummer = store.get().length + 1;
  const neu: Einrichtung = {
    ...input,
    id: `f-${String(laufendeNummer).padStart(3, "0")}`,
    kundennummer: `DG-${1000 + laufendeNummer}`,
  };
  store.set((alle) => [neu, ...alle]);
  return neu;
}

import { createStore } from "@/lib/store/create-store";
import { rezepte } from "./data";
import type { Rezept } from "./types";
import type { Zutat } from "@/features/ingredients/types";

/**
 * Session-Store für im Admin erstellte/bearbeitete Rezepte (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
const store = createStore<Rezept[]>(
  rezepte.map((r) => ({
    ...r,
    zubereitungsschritte: [...r.zubereitungsschritte],
    zutaten: r.zutaten.map((rz) => ({ ...rz })),
    zielgruppen: [...r.zielgruppen],
  }))
);

export function addRezept(input: Omit<Rezept, "id" | "version">): Rezept {
  const neu: Rezept = { ...input, id: `r-${String(store.get().length + 1).padStart(3, "0")}`, version: 1 };
  store.set((alle) => [neu, ...alle]);
  return neu;
}

export function updateRezept(id: string, updates: Omit<Rezept, "id" | "version">) {
  store.set((alle) => alle.map((r) => (r.id === id ? { ...updates, id, version: r.version + 1 } : r)));
}

export function duplicateRezept(id: string): Rezept | undefined {
  const original = store.get().find((r) => r.id === id);
  if (!original) return undefined;
  const heute = new Date().toISOString().slice(0, 10);
  const kopie: Rezept = {
    ...original,
    id: `r-${String(store.get().length + 1).padStart(3, "0")}`,
    name: `${original.name} (Kopie)`,
    version: 1,
    erstelltAm: heute,
    aktualisiertAm: undefined,
    zubereitungsschritte: [...original.zubereitungsschritte],
    zutaten: original.zutaten.map((rz) => ({ ...rz })),
    zielgruppen: [...original.zielgruppen],
  };
  store.set((alle) => [kopie, ...alle]);
  return kopie;
}

export function useRezepte(): Rezept[] {
  return store.useValue();
}

/* ---------- Live-Berechnungshelfer (arbeiten auf der aktuellen Session-Zutatenliste) ---------- */

function zutatByIdIn(zutaten: Zutat[], id: string) {
  return zutaten.find((z) => z.id === id);
}

export const rezeptAllergeneLive = (r: Rezept, zutaten: Zutat[]): string[] => {
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatByIdIn(zutaten, rz.zutatId)?.allergene.forEach((a) => set.add(a)));
  return [...set];
};

export const rezeptZusatzstoffeLive = (r: Rezept, zutaten: Zutat[]): string[] => {
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatByIdIn(zutaten, rz.zutatId)?.zusatzstoffe.forEach((a) => set.add(a)));
  return [...set];
};

const MASSE_FAKTOR: Record<string, number> = { kg: 1, l: 1, g: 0.001, ml: 0.001 };

/** Massenanteil (%) der Zutaten mit dem gegebenen Flag (bio/regional) am Gesamtgewicht des Rezepts. */
function anteilByFlag(r: Rezept, zutaten: Zutat[], flag: "bio" | "regional"): number {
  let gesamt = 0;
  let markiert = 0;
  r.zutaten.forEach((rz) => {
    const faktor = MASSE_FAKTOR[rz.einheit];
    if (!faktor) return; // Stück-Mengen fließen nicht in die Massenberechnung ein
    const masse = rz.menge * faktor;
    gesamt += masse;
    if (zutatByIdIn(zutaten, rz.zutatId)?.[flag]) markiert += masse;
  });
  return gesamt > 0 ? Math.round((markiert / gesamt) * 100) : 0;
}

export const rezeptBioAnteilLive = (r: Rezept, zutaten: Zutat[]): number => anteilByFlag(r, zutaten, "bio");
export const rezeptRegionalAnteilLive = (r: Rezept, zutaten: Zutat[]): number => anteilByFlag(r, zutaten, "regional");

/** Wareneinsatz (Zutatenkosten) gesamt und je Portion, auf Basis der Einkaufspreise. */
export function rezeptWareneinsatzLive(r: Rezept, zutaten: Zutat[]): { gesamt: number; proPortion: number } {
  let gesamt = 0;
  r.zutaten.forEach((rz) => {
    const z = zutatByIdIn(zutaten, rz.zutatId);
    if (!z || z.einkaufspreis == null || z.umrechnungsfaktor === 0) return;
    gesamt += rz.menge * (z.einkaufspreis / z.umrechnungsfaktor);
  });
  const proPortion = r.standardPortionen > 0 ? gesamt / r.standardPortionen : 0;
  return { gesamt: Math.round(gesamt * 100) / 100, proPortion: Math.round(proPortion * 100) / 100 };
}

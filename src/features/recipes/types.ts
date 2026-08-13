import type { Einheit } from "@/lib/types";

export type Schwierigkeitsgrad = "Einfach" | "Mittel" | "Anspruchsvoll";
export type NutriScore = "A" | "B" | "C" | "D" | "E";

export interface RezeptZutat {
  zutatId: string;
  menge: number;
  einheit: Einheit;
}

/** Nährwerte je 100 g eines fertigen Rezepts (vollständiger Satz für die Kennzeichnung, nicht nur kcal). */
export interface RezeptNaehrwerte100 {
  kcal: number;
  kj: number;
  fettG: number;
  gesFettSaeurenG: number;
  kohlenhydrateG: number;
  zuckerG: number;
  ballaststoffeG: number;
  eiweissG: number;
  salzG: number;
  alkoholG: number;
}

export interface Rezept {
  id: string;
  name: string;
  beschreibung: string;
  kategorie: string;
  /** Menschenlesbare Rezeptnummer, unabhängig von der technischen id. */
  rezeptnummer?: string;
  standardPortionen: number;
  /** Gewicht einer Portion in Gramm (aus Kennzeichnungsdaten, falls importiert). */
  portionsgewichtG?: number;
  zubereitungszeitMin: number;
  schwierigkeit: Schwierigkeitsgrad;
  zubereitungsschritte: string[];
  zutaten: RezeptZutat[];
  vegetarisch: boolean;
  vegan: boolean;
  produktionshinweise?: string;
  /** DGE-"Lebenswelten", für die das Rezept freigegeben ist. */
  zielgruppen: string[];
  bildUrl?: string;
  kerntemperaturC?: number;
  lagerhinweis?: string;
  haltbarkeitNachZubereitung?: string;
  erstelltVon: string;
  erstelltAm: string;
  aktualisiertAm?: string;
  aktiv: boolean;
  version: number;
  /**
   * Authoritative, aus Kennzeichnungsdaten importierte Werte (Rezeptebene) — wenn vorhanden,
   * haben sie Vorrang vor den aus Zutaten live berechneten Werten (siehe store.ts), weil die
   * Zutaten-Stammdaten dafür aktuell nur Dummy-Platzhalter ohne echte Nährwerte/Allergene sind
   * (kommen erst mit Anbindung der offenen Zutaten-API). Fehlen sie, greift die Live-Berechnung.
   */
  naehrwertePro100g?: RezeptNaehrwerte100;
  allergeneErfasst?: string[];
  zusatzstoffeErfasst?: string[];
  nutriScore?: NutriScore;
  nutriScoreKategorie?: string;
  naehrwertbezogeneAngaben?: string[];
}

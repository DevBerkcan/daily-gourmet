import type { Einheit } from "@/lib/types";

export type Schwierigkeitsgrad = "Einfach" | "Mittel" | "Anspruchsvoll";

export interface RezeptZutat {
  zutatId: string;
  menge: number;
  einheit: Einheit;
}

export interface Rezept {
  id: string;
  name: string;
  beschreibung: string;
  kategorie: string;
  standardPortionen: number;
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
}

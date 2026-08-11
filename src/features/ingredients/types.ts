import type { Einheit } from "@/lib/types";

export interface Naehrwerte {
  kcal: number;
  eiweissG: number;
  fettG: number;
  kohlenhydrateG: number;
  zuckerG: number;
  salzG: number;
  quelle: "Open Food Facts" | "USDA FoodData Central" | "Manuell";
}

export interface Zutat {
  id: string;
  name: string;
  artikelnummer: string;
  kategorie: string;
  basiseinheit: Einheit;
  einkaufseinheit: string;
  umrechnungsfaktor: number;
  einkaufspreis?: number;
  lieferant: string;
  allergene: string[];
  /** Kennzeichnungspflichtige Zusatzstoffe (E-Nummern etc.), getrennt von Allergenen. */
  zusatzstoffe: string[];
  vegetarisch: boolean;
  vegan: boolean;
  bio: boolean;
  regional: boolean;
  aktiv: boolean;
  /** Nährwerte je 100 g / 100 ml — kommen später live über die Lebensmittel-API */
  naehrwertePro100: Naehrwerte;
}

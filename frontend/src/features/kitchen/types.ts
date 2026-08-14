import type { Einheit } from "@/lib/types";

export type KitchenWorkStatus = "OFFEN" | "BEREITSTELLUNG" | "ZUBEREITUNG" | "FERTIG" | "VERPACKT" | "ABHOLBEREIT";

export type ProduktionsMetaEintrag = {
  start: string;
  fertigBis: string;
  arbeitsplatz: string;
  geraet: string;
  chargen: number;
  portionenJeCharge: number;
  verantwortung: string;
  varianten: string[];
};

export type GesamtbedarfPosition = {
  zutatId: string;
  name: string;
  menge: number;
  einheit: Einheit;
  kategorie: string;
  lagerort: string;
  bereitgestellt: number;
  rezepte: string[];
  allergene: string[];
};

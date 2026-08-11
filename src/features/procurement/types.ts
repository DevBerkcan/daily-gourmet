export type EinkaufslistenStatus = "DRAFT" | "REVIEWED" | "ORDERED" | "COMPLETED";

export interface EinkaufslistenPosition {
  zutatId: string;
  gesamtmengeBasis: number;
  einkaufsmenge: number;
  rezepte: string[];
}

export interface Einkaufsliste {
  id: string;
  bezeichnung: string;
  kalenderwoche: number;
  standortId: string;
  status: EinkaufslistenStatus;
  positionen: EinkaufslistenPosition[];
}

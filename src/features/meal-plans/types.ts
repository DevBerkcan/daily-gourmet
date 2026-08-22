export type SpeiseplanStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export interface SpeiseplanTag {
  /** Backend-Tages-Id (GUID) — nötig, um gezielt einen Tag per PUT zu aktualisieren. */
  id?: string;
  wochentag: string;
  datum: string;
  rezeptIds: string[];
  hinweis?: string;
}

export interface Speiseplan {
  id: string;
  kalenderwoche: number;
  jahr: number;
  status: SpeiseplanStatus;
  standortIds: string[];
  einrichtungIds: string[];
  tage: SpeiseplanTag[];
}

/** Aufbereitete Umsatz-Zeile für das Reporting (aus Bestellung + Speiseplan + Einrichtung verknüpft). */
export interface UmsatzZeile {
  bestellungId: string;
  speiseplanId: string;
  kalenderwoche: number;
  jahr: number;
  einrichtungId: string;
  einrichtungName: string;
  standortId: string;
  standortName: string;
  portionen: number;
  portionspreis: number;
  umsatz: number;
}

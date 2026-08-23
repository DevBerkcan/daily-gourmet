export type SpeiseplanStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

/** Menülinie — die parallele Ernährungsschiene, der ein Gericht an diesem Tag zugeordnet ist. Ein
 * Tag/Linie kann mehr als ein Gericht enthalten (z. B. Hauptgericht + gemeinsames Dessert). */
export type Menuelinie = "Normalkost" | "Veggie" | "Glutenfrei-Laktosefrei" | "Alternativ";
export const MENUELINIEN: Menuelinie[] = ["Normalkost", "Veggie", "Glutenfrei-Laktosefrei", "Alternativ"];

export interface SpeiseplanGericht {
  rezeptId: string;
  menuelinie: Menuelinie;
}

export interface SpeiseplanTag {
  /** Backend-Tages-Id (GUID) — nötig, um gezielt einen Tag per PUT zu aktualisieren. */
  id?: string;
  wochentag: string;
  datum: string;
  gerichte: SpeiseplanGericht[];
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
  /** Eine von bis zu 8 wiederverwendbaren Grundwochen ("Vorlage 1-8") statt einer echten Woche. */
  istVorlage?: boolean;
  vorlagenSlot?: number;
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

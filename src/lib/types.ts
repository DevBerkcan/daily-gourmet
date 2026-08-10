/**
 * Zentrale Domain-Typen — spiegeln 1:1 die geplanten DTOs des C#-Backends (/api/v1).
 * In Phase 2 werden die Dummy-Daten durch TanStack-Query-Hooks gegen das Backend ersetzt.
 */

export type Rolle =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "KITCHEN_MANAGER"
  | "KITCHEN_STAFF"
  | "FACILITY_ADMIN"
  | "FACILITY_USER"
  | "READ_ONLY";

export type TenantStatus = "AKTIV" | "GESPERRT" | "ARCHIVIERT";
export type BenutzerStatus = "AKTIV" | "EINGELADEN" | "DEAKTIVIERT";
export type SpeiseplanStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type BestellStatus = "DRAFT" | "SUBMITTED" | "CONFIRMED" | "LOCKED" | "CANCELLED";
export type ProduktionsStatus = "PLANNED" | "PREPARING" | "COMPLETED" | "CANCELLED";
export type EinkaufslistenStatus = "DRAFT" | "REVIEWED" | "ORDERED" | "COMPLETED";
export type Einheit = "g" | "kg" | "ml" | "l" | "Stück";
export type Schwierigkeitsgrad = "Einfach" | "Mittel" | "Anspruchsvoll";

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  ansprechpartner: string;
  email: string;
  erstelltAm: string;
  benutzerAnzahl: number;
  einrichtungenAnzahl: number;
  letzteAktivitaet: string;
}

export interface Benutzer {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  rolle: Rolle;
  status: BenutzerStatus;
  letzteAnmeldung: string | null;
  fehlgeschlageneLogins: number;
  einrichtungId?: string;
}

export interface Standort {
  id: string;
  name: string;
  anschrift: string;
  kontaktperson: string;
  kapazitaetPortionen: number;
  status: "AKTIV" | "INAKTIV";
}

export interface Einrichtung {
  id: string;
  name: string;
  kundennummer: string;
  anschrift: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  standortId: string;
  bestellfrist: string;
  aktiveWochentage: string[];
  /** Vertraglich vereinbarter Verkaufspreis je Portion (€), Basis für Umsatzmessung. */
  portionspreis: number;
  status: "AKTIV" | "INAKTIV";
  notizen?: string;
}

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

export interface SpeiseplanTag {
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

export interface BestellPosition {
  datum: string;
  rezeptId: string;
  portionen: number;
  hinweis?: string;
}

export interface Bestellung {
  id: string;
  einrichtungId: string;
  speiseplanId: string;
  status: BestellStatus;
  positionen: BestellPosition[];
  abgesendetAm?: string;
  frist: string;
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

export interface ProduktionsPosition {
  rezeptId: string;
  bestellteMenge: number;
  zusatzMenge: number;
  status: ProduktionsStatus;
  begruendung?: string;
}

export interface ProduktionsPlan {
  id: string;
  datum: string;
  standortId: string;
  positionen: ProduktionsPosition[];
}

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

export interface AuditEintrag {
  id: string;
  tenant: string;
  benutzer: string;
  aktion: string;
  entitaet: string;
  entitaetId: string;
  zeitpunkt: string;
  begruendung?: string;
}

export interface Benachrichtigung {
  id: string;
  titel: string;
  text: string;
  zeitpunkt: string;
  gelesen: boolean;
}

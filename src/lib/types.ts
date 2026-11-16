/**
 * Zentrale Domain-Typen — spiegeln 1:1 die geplanten DTOs des C#-Backends (/api/v1).
 * In Phase 2 werden die Dummy-Daten durch TanStack-Query-Hooks gegen das Backend ersetzt.
 */

export type Rolle =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "FACILITY_ADMIN"
  | "FACILITY_USER"
  | "READ_ONLY";

export type BenutzerStatus = "AKTIV" | "EINGELADEN" | "DEAKTIVIERT";
export type BestellStatus = "DRAFT" | "SUBMITTED" | "CONFIRMED" | "LOCKED" | "CANCELLED";
export type Einheit = "g" | "kg" | "ml" | "l" | "Stück";

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

export interface BestellPosition {
  /** Backend-Positions-Id (GUID) — nötig für die Anpassung am Liefertag (nur Reduzieren, siehe
   * useAdjustBestellungSameDay); beim Speichern eines ganzen Entwurfs/Absendens ungenutzt. */
  id?: string;
  datum: string;
  rezeptId: string;
  /** Abrechenbare Menge (nach einer evtl. Reduzierung am Liefertag). */
  portionen: number;
  /** Ursprünglich bestellte Menge — nur gesetzt, wenn am Liefertag reduziert wurde (Einkauf/Planung
   * basiert hierauf, Abrechnung auf `portionen`). */
  urspruenglichePortionen?: number;
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
  /** Einrichtung hat eine Vereinbarung zur Reduzierung am Liefertag. */
  tagesanpassungErlaubt?: boolean;
  /** Tagesfrist für die Reduzierung, z. B. "09:00". */
  tagesanpassungFrist?: string;
}

/** Ursprünglich vs. angepasst je Bestellung — Differenz = am Liefertag reduzierte Portionen. */
export function bestellSummen(bestellung: Bestellung) {
  const angepasst = bestellung.positionen.reduce((s, p) => s + p.portionen, 0);
  const urspruenglich = bestellung.positionen.reduce((s, p) => s + (p.urspruenglichePortionen ?? p.portionen), 0);
  return { urspruenglich, angepasst, differenz: urspruenglich - angepasst };
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

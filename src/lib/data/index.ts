/**
 * DUMMY-DATEN — Phase 1 (nur Frontend).
 * Diese Daten werden in Phase 2 vollständig durch API-Aufrufe
 * gegen das C#-Backend (/api/v1) ersetzt. Die Strukturen entsprechen
 * bereits den geplanten Response-DTOs (siehe docs/api-endpunkte.md).
 */
import type {
  Benutzer, Standort, Einrichtung,
  Bestellung,
  AuditEintrag, Benachrichtigung, BestellStatus,
} from "../types";

export const benutzer: Benutzer[] = [
  { id: "u-001", tenantId: null, name: "Berk-Can Aydin", email: "admin@gentle-group.de", rolle: "SUPER_ADMIN", status: "AKTIV", letzteAnmeldung: "heute, 08:12", fehlgeschlageneLogins: 0 },
  { id: "u-002", tenantId: "t-001", name: "Miriam Hoffmann", email: "m.hoffmann@dailygourmet.de", rolle: "TENANT_OWNER", status: "AKTIV", letzteAnmeldung: "heute, 07:45", fehlgeschlageneLogins: 0 },
  { id: "u-003", tenantId: "t-001", name: "Jan Berger", email: "j.berger@dailygourmet.de", rolle: "TENANT_ADMIN", status: "AKTIV", letzteAnmeldung: "gestern, 16:20", fehlgeschlageneLogins: 1 },
  { id: "u-004", tenantId: "t-001", name: "Petra Salomon", email: "p.salomon@dailygourmet.de", rolle: "KITCHEN_MANAGER", status: "AKTIV", letzteAnmeldung: "heute, 05:58", fehlgeschlageneLogins: 0 },
  { id: "u-005", tenantId: "t-001", name: "Ali Demir", email: "a.demir@dailygourmet.de", rolle: "KITCHEN_STAFF", status: "AKTIV", letzteAnmeldung: "heute, 06:03", fehlgeschlageneLogins: 0 },
  { id: "u-006", tenantId: "t-001", name: "Claudia Winter", email: "sekretariat@musterschule-nord.de", rolle: "FACILITY_ADMIN", status: "AKTIV", letzteAnmeldung: "gestern, 09:12", fehlgeschlageneLogins: 0, einrichtungId: "f-001" },
  { id: "u-007", tenantId: "t-001", name: "Frank Otten", email: "verwaltung@musterschule-sued.de", rolle: "FACILITY_USER", status: "EINGELADEN", letzteAnmeldung: null, fehlgeschlageneLogins: 0, einrichtungId: "f-002" },
  { id: "u-008", tenantId: "t-001", name: "Ruth Sander", email: "r.sander@dailygourmet.de", rolle: "READ_ONLY", status: "DEAKTIVIERT", letzteAnmeldung: "12.06.2026", fehlgeschlageneLogins: 0 },
];

export const standorte: Standort[] = [
  { id: "s-001", name: "Daily Gourmet", anschrift: "Eiland 2, 42103 Wuppertal", kontaktperson: "Petra Salomon", kapazitaetPortionen: 3400, status: "AKTIV" },
];

export const einrichtungen: Einrichtung[] = [
  { id: "f-001", name: "Musterschule Nord", kundennummer: "DG-1001", anschrift: "Nordstraße 12, 40477 Düsseldorf", ansprechpartner: "Claudia Winter", email: "sekretariat@musterschule-nord.de", telefon: "0211 555 101", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], portionspreis: 4.8, status: "AKTIV", notizen: "Vegetarische Linie sehr gefragt." },
  { id: "f-002", name: "Musterschule Süd", kundennummer: "DG-1002", anschrift: "Südallee 44, 40217 Düsseldorf", ansprechpartner: "Frank Otten", email: "verwaltung@musterschule-sued.de", telefon: "0211 555 202", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do"], portionspreis: 4.6, status: "AKTIV" },
  { id: "f-003", name: "Kita Sonnenblume", kundennummer: "DG-1003", anschrift: "Blumenweg 3, 40589 Düsseldorf", ansprechpartner: "Hanna Bruns", email: "leitung@kita-sonnenblume.de", telefon: "0211 555 303", standortId: "s-001", bestellfrist: "Vortag, 08:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], portionspreis: 5.2, status: "AKTIV" },
  { id: "f-004", name: "Seniorenzentrum Am Park", kundennummer: "DG-1004", anschrift: "Parkstraße 88, 40476 Düsseldorf", ansprechpartner: "Georg Lentz", email: "kueche@sz-ampark.de", telefon: "0211 555 404", standortId: "s-001", bestellfrist: "Vortag, 10:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], portionspreis: 6.5, status: "INAKTIV", notizen: "Vertrag pausiert bis September." },
];

export const bestellungen: Bestellung[] = [
  {
    id: "b-1001", einrichtungId: "f-001", speiseplanId: "mp-032", status: "CONFIRMED", abgesendetAm: "2026-08-01, 14:22", frist: "Vortag, 09:00 Uhr",
    positionen: [
      { datum: "2026-08-06", rezeptId: "r-088", portionen: 145 },
      { datum: "2026-08-07", rezeptId: "r-037", portionen: 120, hinweis: "10 Portionen ohne Sauce" },
      { datum: "2026-08-07", rezeptId: "r-024", portionen: 35 },
    ],
  },
  {
    id: "b-1002", einrichtungId: "f-002", speiseplanId: "mp-032", status: "SUBMITTED", abgesendetAm: "2026-08-04, 08:41", frist: "Vortag, 09:00 Uhr",
    positionen: [
      { datum: "2026-08-06", rezeptId: "r-088", portionen: 98 },
      { datum: "2026-08-07", rezeptId: "r-037", portionen: 90 },
    ],
  },
  {
    id: "b-1003", einrichtungId: "f-003", speiseplanId: "mp-032", status: "DRAFT", frist: "Vortag, 08:00 Uhr",
    positionen: [ { datum: "2026-08-07", rezeptId: "r-024", portionen: 42 } ],
  },
  {
    id: "b-0991", einrichtungId: "f-001", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 10:05", frist: "Vortag, 09:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-037", portionen: 140 } ],
  },
  {
    id: "b-0992", einrichtungId: "f-002", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 08:50", frist: "Vortag, 09:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-037", portionen: 95 }, { datum: "2026-07-31", rezeptId: "r-088", portionen: 60 } ],
  },
  {
    id: "b-0993", einrichtungId: "f-003", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 07:40", frist: "Vortag, 08:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-024", portionen: 30 } ],
  },
];

export const auditLog: AuditEintrag[] = [
  { id: "a-9001", tenant: "Daily Gourmet", benutzer: "Jan Berger", aktion: "Bestellung nach Frist geändert", entitaet: "Bestellung", entitaetId: "b-0991", zeitpunkt: "heute, 09:41", begruendung: "Telefonische Korrektur der Schule (Ausflug 5b)" },
  { id: "a-9002", tenant: "Daily Gourmet", benutzer: "Petra Salomon", aktion: "Produktionsmenge manuell geändert", entitaet: "Produktionsplan", entitaetId: "pp-0806", zeitpunkt: "heute, 06:12", begruendung: "Sicherheitsmenge +12" },
  { id: "a-9003", tenant: "Daily Gourmet", benutzer: "Miriam Hoffmann", aktion: "Speiseplan veröffentlicht", entitaet: "Speiseplan", entitaetId: "mp-032", zeitpunkt: "01.08.2026, 11:02" },
  { id: "a-9004", tenant: "Plattform", benutzer: "Berk-Can Aydin", aktion: "Mandant gesperrt", entitaet: "Tenant", entitaetId: "t-003", zeitpunkt: "25.07.2026, 15:30", begruendung: "Zahlungsverzug" },
  { id: "a-9005", tenant: "Daily Gourmet", benutzer: "System", aktion: "Fehlgeschlagener Login", entitaet: "Benutzer", entitaetId: "u-003", zeitpunkt: "gestern, 16:18" },
  { id: "a-9006", tenant: "Daily Gourmet", benutzer: "Miriam Hoffmann", aktion: "Benutzer eingeladen", entitaet: "Benutzer", entitaetId: "u-007", zeitpunkt: "28.07.2026, 13:44" },
];

export const benachrichtigungen: Benachrichtigung[] = [
  { id: "n-001", titel: "Bestellfrist läuft ab", text: "Kita Sonnenblume hat für Freitag noch nicht bestellt. Frist: morgen 08:00 Uhr.", zeitpunkt: "vor 20 Minuten", gelesen: false },
  { id: "n-002", titel: "Bestellung abgesendet", text: "Musterschule Süd hat die Bestellung für KW 32 abgesendet.", zeitpunkt: "heute, 08:41", gelesen: false },
  { id: "n-003", titel: "Speiseplan veröffentlicht", text: "Der Speiseplan für KW 32 wurde für 3 Einrichtungen veröffentlicht.", zeitpunkt: "01.08.2026", gelesen: true },
];

/* Hilfsfunktionen für Dummy-Zugriffe */
export const einrichtungById = (id: string) => einrichtungen.find((e) => e.id === id);
export const standortById = (id: string) => standorte.find((s) => s.id === id);

/* ---------- Umsatz ---------- */

const UMSATZ_STATUS: BestellStatus[] = ["SUBMITTED", "CONFIRMED", "LOCKED"];

export const bestellungPortionenGesamt = (b: Bestellung): number =>
  b.positionen.reduce((sum, p) => sum + p.portionen, 0);

/** Nur abgesendete/bestätigte/gesperrte Bestellungen zählen als realisierter Umsatz — keine Entwürfe/Stornos. */
export const bestellungZaehltAlsUmsatz = (b: Bestellung): boolean => UMSATZ_STATUS.includes(b.status);

export const bestellungUmsatz = (b: Bestellung): number => {
  if (!bestellungZaehltAlsUmsatz(b)) return 0;
  const preis = einrichtungById(b.einrichtungId)?.portionspreis ?? 0;
  return Math.round(bestellungPortionenGesamt(b) * preis * 100) / 100;
};

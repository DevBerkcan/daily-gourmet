/**
 * DUMMY-DATEN — Phase 1 (nur Frontend).
 * Diese Daten werden in Phase 2 vollständig durch API-Aufrufe
 * gegen das C#-Backend (/api/v1) ersetzt. Die Strukturen entsprechen
 * bereits den geplanten Response-DTOs (siehe docs/api-endpunkte.md).
 */
import type {
  Tenant, Benutzer, Standort, Einrichtung, Zutat, Rezept,
  Speiseplan, Bestellung, ProduktionsPlan, Einkaufsliste,
  AuditEintrag, Benachrichtigung,
} from "../types";

export const tenants: Tenant[] = [
  { id: "t-001", name: "Daily Gourmet", status: "AKTIV", ansprechpartner: "Miriam Hoffmann", email: "m.hoffmann@dailygourmet.de", erstelltAm: "2026-01-12", benutzerAnzahl: 14, einrichtungenAnzahl: 6, letzteAktivitaet: "vor 8 Minuten" },
  { id: "t-002", name: "Küchenwerk Rhein", status: "AKTIV", ansprechpartner: "Tobias Klein", email: "klein@kuechenwerk-rhein.de", erstelltAm: "2026-03-04", benutzerAnzahl: 9, einrichtungenAnzahl: 4, letzteAktivitaet: "vor 2 Stunden" },
  { id: "t-003", name: "VitalMenü GmbH", status: "GESPERRT", ansprechpartner: "Sandra Ilg", email: "ilg@vitalmenue.de", erstelltAm: "2025-11-20", benutzerAnzahl: 5, einrichtungenAnzahl: 2, letzteAktivitaet: "vor 12 Tagen" },
  { id: "t-004", name: "Campus Catering West", status: "AKTIV", ansprechpartner: "Deniz Aydin", email: "aydin@campus-west.de", erstelltAm: "2026-05-18", benutzerAnzahl: 7, einrichtungenAnzahl: 3, letzteAktivitaet: "gestern" },
];

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
  { id: "s-001", name: "Zentralküche Düsseldorf", anschrift: "Ronsdorfer Str. 74, 40233 Düsseldorf", kontaktperson: "Petra Salomon", kapazitaetPortionen: 2500, status: "AKTIV" },
  { id: "s-002", name: "Produktionsküche Neuss", anschrift: "Hammer Landstr. 5, 41460 Neuss", kontaktperson: "Ali Demir", kapazitaetPortionen: 900, status: "AKTIV" },
];

export const einrichtungen: Einrichtung[] = [
  { id: "f-001", name: "Musterschule Nord", kundennummer: "DG-1001", anschrift: "Nordstraße 12, 40477 Düsseldorf", ansprechpartner: "Claudia Winter", email: "sekretariat@musterschule-nord.de", telefon: "0211 555 101", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], status: "AKTIV", notizen: "Vegetarische Linie sehr gefragt." },
  { id: "f-002", name: "Musterschule Süd", kundennummer: "DG-1002", anschrift: "Südallee 44, 40217 Düsseldorf", ansprechpartner: "Frank Otten", email: "verwaltung@musterschule-sued.de", telefon: "0211 555 202", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do"], status: "AKTIV" },
  { id: "f-003", name: "Kita Sonnenblume", kundennummer: "DG-1003", anschrift: "Blumenweg 3, 40589 Düsseldorf", ansprechpartner: "Hanna Bruns", email: "leitung@kita-sonnenblume.de", telefon: "0211 555 303", standortId: "s-002", bestellfrist: "Vortag, 08:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], status: "AKTIV" },
  { id: "f-004", name: "Seniorenzentrum Am Park", kundennummer: "DG-1004", anschrift: "Parkstraße 88, 40476 Düsseldorf", ansprechpartner: "Georg Lentz", email: "kueche@sz-ampark.de", telefon: "0211 555 404", standortId: "s-002", bestellfrist: "Vortag, 10:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], status: "INAKTIV", notizen: "Vertrag pausiert bis September." },
];

export const zutaten: Zutat[] = [
  { id: "z-001", name: "Kartoffeln, festkochend", artikelnummer: "ART-0101", kategorie: "Gemüse", basiseinheit: "kg", einkaufseinheit: "Sack (25 kg)", umrechnungsfaktor: 25, einkaufspreis: 21.5, lieferant: "Rheinland Frische GmbH", allergene: [], vegetarisch: true, vegan: true, aktiv: true, naehrwertePro100: { kcal: 77, eiweissG: 2.0, fettG: 0.1, kohlenhydrateG: 15.6, zuckerG: 0.8, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-002", name: "Hähnchenbrustfilet", artikelnummer: "ART-0202", kategorie: "Fleisch & Geflügel", basiseinheit: "kg", einkaufseinheit: "Karton (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 68.9, lieferant: "Geflügelhof Brandt", allergene: [], vegetarisch: false, vegan: false, aktiv: true, naehrwertePro100: { kcal: 110, eiweissG: 23.0, fettG: 1.5, kohlenhydrateG: 0, zuckerG: 0, salzG: 0.1, quelle: "USDA FoodData Central" } },
  { id: "z-003", name: "Vollmilch 3,5 %", artikelnummer: "ART-0303", kategorie: "Molkereiprodukte", basiseinheit: "l", einkaufseinheit: "Kiste (12 l)", umrechnungsfaktor: 12, einkaufspreis: 13.1, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], vegetarisch: true, vegan: false, aktiv: true, naehrwertePro100: { kcal: 64, eiweissG: 3.3, fettG: 3.5, kohlenhydrateG: 4.8, zuckerG: 4.8, salzG: 0.13, quelle: "Open Food Facts" } },
  { id: "z-004", name: "Weizenmehl Type 405", artikelnummer: "ART-0404", kategorie: "Trockenware", basiseinheit: "kg", einkaufseinheit: "Sack (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 8.4, lieferant: "Mühle Reckmann", allergene: ["Gluten"], vegetarisch: true, vegan: true, aktiv: true, naehrwertePro100: { kcal: 348, eiweissG: 10.0, fettG: 1.0, kohlenhydrateG: 72.0, zuckerG: 0.7, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-005", name: "Tomaten, passiert", artikelnummer: "ART-0505", kategorie: "Konserven", basiseinheit: "l", einkaufseinheit: "Karton (6 × 1 l)", umrechnungsfaktor: 6, einkaufspreis: 9.9, lieferant: "Bella Cucina Import", allergene: [], vegetarisch: true, vegan: true, aktiv: true, naehrwertePro100: { kcal: 32, eiweissG: 1.4, fettG: 0.3, kohlenhydrateG: 5.3, zuckerG: 4.3, salzG: 0.35, quelle: "Open Food Facts" } },
  { id: "z-006", name: "Penne (Hartweizen)", artikelnummer: "ART-0606", kategorie: "Trockenware", basiseinheit: "kg", einkaufseinheit: "Karton (12 kg)", umrechnungsfaktor: 12, einkaufspreis: 17.8, lieferant: "Bella Cucina Import", allergene: ["Gluten"], vegetarisch: true, vegan: true, aktiv: true, naehrwertePro100: { kcal: 359, eiweissG: 12.5, fettG: 1.8, kohlenhydrateG: 71.0, zuckerG: 3.2, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-007", name: "Rote Linsen", artikelnummer: "ART-0707", kategorie: "Hülsenfrüchte", basiseinheit: "kg", einkaufseinheit: "Sack (5 kg)", umrechnungsfaktor: 5, einkaufspreis: 12.2, lieferant: "BioGroß Handel", allergene: [], vegetarisch: true, vegan: true, aktiv: true, naehrwertePro100: { kcal: 343, eiweissG: 24.0, fettG: 1.9, kohlenhydrateG: 56.0, zuckerG: 1.9, salzG: 0.02, quelle: "USDA FoodData Central" } },
  { id: "z-008", name: "Sahne 30 %", artikelnummer: "ART-0808", kategorie: "Molkereiprodukte", basiseinheit: "l", einkaufseinheit: "Kiste (10 l)", umrechnungsfaktor: 10, einkaufspreis: 24.5, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], vegetarisch: true, vegan: false, aktiv: false, naehrwertePro100: { kcal: 288, eiweissG: 2.4, fettG: 30.0, kohlenhydrateG: 3.2, zuckerG: 3.2, salzG: 0.08, quelle: "Open Food Facts" } },
];

export const rezepte: Rezept[] = [
  {
    id: "r-001", name: "Penne al Pomodoro", beschreibung: "Klassische Pasta mit fruchtiger Tomatensauce und Basilikum.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 45,
    zubereitungsschritte: ["Zwiebeln und Knoblauch anschwitzen.", "Passierte Tomaten zugeben, 20 Min. köcheln.", "Penne bissfest kochen.", "Sauce abschmecken und mit den Penne mischen."],
    zutaten: [ { zutatId: "z-006", menge: 1.2, einheit: "kg" }, { zutatId: "z-005", menge: 2, einheit: "l" } ],
    vegetarisch: true, vegan: true, produktionshinweise: "Sauce kann am Vortag vorbereitet werden.", aktiv: true, version: 3,
  },
  {
    id: "r-002", name: "Hähnchengeschnetzeltes mit Kartoffeln", beschreibung: "Zartes Geschnetzeltes in heller Sauce mit Salzkartoffeln.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 60,
    zubereitungsschritte: ["Kartoffeln schälen und garen.", "Hähnchen in Streifen schneiden und anbraten.", "Sauce mit Milch aufgießen und binden.", "Alles zusammenführen und heiß halten."],
    zutaten: [ { zutatId: "z-002", menge: 1.5, einheit: "kg" }, { zutatId: "z-001", menge: 2.5, einheit: "kg" }, { zutatId: "z-003", menge: 0.8, einheit: "l" } ],
    vegetarisch: false, vegan: false, aktiv: true, version: 5,
  },
  {
    id: "r-003", name: "Rote-Linsen-Curry", beschreibung: "Mildes Curry mit roten Linsen, Kokosnote und Reis.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 50,
    zubereitungsschritte: ["Linsen waschen.", "Gewürze anrösten, Linsen zugeben.", "Mit Flüssigkeit aufgießen und garen.", "Abschmecken und servieren."],
    zutaten: [ { zutatId: "z-007", menge: 1.4, einheit: "kg" }, { zutatId: "z-005", menge: 1, einheit: "l" } ],
    vegetarisch: true, vegan: true, produktionshinweise: "Milde Würzung für Schulen beachten.", aktiv: true, version: 2,
  },
  {
    id: "r-004", name: "Pfannkuchen mit Apfelmus", beschreibung: "Süßer Klassiker, beliebt bei Kita und Grundschule.", kategorie: "Süßspeise", standardPortionen: 10, zubereitungszeitMin: 40,
    zubereitungsschritte: ["Teig aus Mehl, Milch und Eiern anrühren.", "Pfannkuchen portionsweise ausbacken.", "Mit Apfelmus anrichten."],
    zutaten: [ { zutatId: "z-004", menge: 1, einheit: "kg" }, { zutatId: "z-003", menge: 1.5, einheit: "l" } ],
    vegetarisch: true, vegan: false, aktiv: true, version: 1,
  },
];

export const speiseplaene: Speiseplan[] = [
  {
    id: "mp-032", kalenderwoche: 32, jahr: 2026, status: "PUBLISHED", standortIds: ["s-001"], einrichtungIds: ["f-001", "f-002", "f-003"],
    tage: [
      { wochentag: "Montag", datum: "2026-08-03", rezeptIds: ["r-001", "r-004"] },
      { wochentag: "Dienstag", datum: "2026-08-04", rezeptIds: ["r-002"] },
      { wochentag: "Mittwoch", datum: "2026-08-05", rezeptIds: ["r-003", "r-004"], hinweis: "Aktionstag: vegetarische Woche" },
      { wochentag: "Donnerstag", datum: "2026-08-06", rezeptIds: ["r-001"] },
      { wochentag: "Freitag", datum: "2026-08-07", rezeptIds: ["r-002", "r-003"] },
    ],
  },
  {
    id: "mp-033", kalenderwoche: 33, jahr: 2026, status: "REVIEW", standortIds: ["s-001", "s-002"], einrichtungIds: ["f-001", "f-002"],
    tage: [
      { wochentag: "Montag", datum: "2026-08-10", rezeptIds: ["r-003"] },
      { wochentag: "Dienstag", datum: "2026-08-11", rezeptIds: ["r-001"] },
      { wochentag: "Mittwoch", datum: "2026-08-12", rezeptIds: ["r-002"] },
      { wochentag: "Donnerstag", datum: "2026-08-13", rezeptIds: ["r-004"] },
      { wochentag: "Freitag", datum: "2026-08-14", rezeptIds: ["r-001"] },
    ],
  },
  {
    id: "mp-031", kalenderwoche: 31, jahr: 2026, status: "CLOSED", standortIds: ["s-001"], einrichtungIds: ["f-001", "f-002", "f-003"],
    tage: [],
  },
];

export const bestellungen: Bestellung[] = [
  {
    id: "b-1001", einrichtungId: "f-001", speiseplanId: "mp-032", status: "CONFIRMED", abgesendetAm: "2026-08-01, 14:22", frist: "Vortag, 09:00 Uhr",
    positionen: [
      { datum: "2026-08-06", rezeptId: "r-001", portionen: 145 },
      { datum: "2026-08-07", rezeptId: "r-002", portionen: 120, hinweis: "10 Portionen ohne Sauce" },
      { datum: "2026-08-07", rezeptId: "r-003", portionen: 35 },
    ],
  },
  {
    id: "b-1002", einrichtungId: "f-002", speiseplanId: "mp-032", status: "SUBMITTED", abgesendetAm: "2026-08-04, 08:41", frist: "Vortag, 09:00 Uhr",
    positionen: [
      { datum: "2026-08-06", rezeptId: "r-001", portionen: 98 },
      { datum: "2026-08-07", rezeptId: "r-002", portionen: 90 },
    ],
  },
  {
    id: "b-1003", einrichtungId: "f-003", speiseplanId: "mp-032", status: "DRAFT", frist: "Vortag, 08:00 Uhr",
    positionen: [ { datum: "2026-08-07", rezeptId: "r-003", portionen: 42 } ],
  },
  {
    id: "b-0991", einrichtungId: "f-001", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 10:05", frist: "Vortag, 09:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-002", portionen: 140 } ],
  },
];

export const produktionsplaene: ProduktionsPlan[] = [
  {
    id: "pp-0806", datum: "2026-08-06", standortId: "s-001",
    positionen: [
      { rezeptId: "r-001", bestellteMenge: 243, zusatzMenge: 12, status: "PREPARING", begruendung: "Erfahrungswert Nachbestellungen Musterschule Nord" },
      { rezeptId: "r-004", bestellteMenge: 60, zusatzMenge: 0, status: "PLANNED" },
    ],
  },
  {
    id: "pp-0807", datum: "2026-08-07", standortId: "s-001",
    positionen: [
      { rezeptId: "r-002", bestellteMenge: 210, zusatzMenge: 10, status: "PLANNED", begruendung: "Sicherheitsmenge Freitag" },
      { rezeptId: "r-003", bestellteMenge: 77, zusatzMenge: 5, status: "PLANNED" },
    ],
  },
];

export const einkaufslisten: Einkaufsliste[] = [
  {
    id: "el-032", bezeichnung: "Bedarf KW 32 — Zentralküche", kalenderwoche: 32, standortId: "s-001", status: "REVIEWED",
    positionen: [
      { zutatId: "z-006", gesamtmengeBasis: 30.6, einkaufsmenge: 3, rezepte: ["Penne al Pomodoro"] },
      { zutatId: "z-005", gesamtmengeBasis: 59.2, einkaufsmenge: 10, rezepte: ["Penne al Pomodoro", "Rote-Linsen-Curry"] },
      { zutatId: "z-002", gesamtmengeBasis: 33.0, einkaufsmenge: 4, rezepte: ["Hähnchengeschnetzeltes"] },
      { zutatId: "z-001", gesamtmengeBasis: 55.0, einkaufsmenge: 3, rezepte: ["Hähnchengeschnetzeltes"] },
      { zutatId: "z-007", gesamtmengeBasis: 11.5, einkaufsmenge: 3, rezepte: ["Rote-Linsen-Curry"] },
    ],
  },
  { id: "el-031", bezeichnung: "Bedarf KW 31 — Zentralküche", kalenderwoche: 31, standortId: "s-001", status: "COMPLETED", positionen: [] },
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
export const rezeptById = (id: string) => rezepte.find((r) => r.id === id);
export const zutatById = (id: string) => zutaten.find((z) => z.id === id);
export const einrichtungById = (id: string) => einrichtungen.find((e) => e.id === id);
export const standortById = (id: string) => standorte.find((s) => s.id === id);

/** Allergene eines Rezepts werden automatisch aus den Zutaten ermittelt. */
export const rezeptAllergene = (r: Rezept): string[] => {
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatById(rz.zutatId)?.allergene.forEach((a) => set.add(a)));
  return [...set];
};

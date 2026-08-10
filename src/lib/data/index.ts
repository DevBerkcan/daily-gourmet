/**
 * DUMMY-DATEN — Phase 1 (nur Frontend).
 * Diese Daten werden in Phase 2 vollständig durch API-Aufrufe
 * gegen das C#-Backend (/api/v1) ersetzt. Die Strukturen entsprechen
 * bereits den geplanten Response-DTOs (siehe docs/api-endpunkte.md).
 */
import type {
  Tenant, Benutzer, Standort, Einrichtung, Zutat, Rezept,
  Speiseplan, Bestellung, ProduktionsPlan, Einkaufsliste,
  AuditEintrag, Benachrichtigung, SpeiseplanStatus, BestellStatus, UmsatzZeile,
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
  { id: "f-001", name: "Musterschule Nord", kundennummer: "DG-1001", anschrift: "Nordstraße 12, 40477 Düsseldorf", ansprechpartner: "Claudia Winter", email: "sekretariat@musterschule-nord.de", telefon: "0211 555 101", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], portionspreis: 4.8, status: "AKTIV", notizen: "Vegetarische Linie sehr gefragt." },
  { id: "f-002", name: "Musterschule Süd", kundennummer: "DG-1002", anschrift: "Südallee 44, 40217 Düsseldorf", ansprechpartner: "Frank Otten", email: "verwaltung@musterschule-sued.de", telefon: "0211 555 202", standortId: "s-001", bestellfrist: "Vortag, 09:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do"], portionspreis: 4.6, status: "AKTIV" },
  { id: "f-003", name: "Kita Sonnenblume", kundennummer: "DG-1003", anschrift: "Blumenweg 3, 40589 Düsseldorf", ansprechpartner: "Hanna Bruns", email: "leitung@kita-sonnenblume.de", telefon: "0211 555 303", standortId: "s-002", bestellfrist: "Vortag, 08:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr"], portionspreis: 5.2, status: "AKTIV" },
  { id: "f-004", name: "Seniorenzentrum Am Park", kundennummer: "DG-1004", anschrift: "Parkstraße 88, 40476 Düsseldorf", ansprechpartner: "Georg Lentz", email: "kueche@sz-ampark.de", telefon: "0211 555 404", standortId: "s-002", bestellfrist: "Vortag, 10:00 Uhr", aktiveWochentage: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], portionspreis: 6.5, status: "INAKTIV", notizen: "Vertrag pausiert bis September." },
];

/* Feste Auswahllisten für Formulare, Filter und Kategorisierung */
export const ZUTAT_KATEGORIEN = ["Gemüse", "Obst", "Fleisch & Geflügel", "Fisch", "Molkereiprodukte", "Eier & Frischware", "Trockenware", "Konserven", "Hülsenfrüchte", "Gewürze & Saucen", "Sonstiges"];
export const REZEPT_KATEGORIEN = ["Hauptgericht", "Beilage", "Suppe", "Vorspeise/Salat", "Süßspeise", "Frühstück", "Snack"];
/** EU-14-Liste der kennzeichnungspflichtigen Allergene. */
export const ALLERGENE_LISTE = ["Gluten", "Krebstiere", "Eier", "Fisch", "Erdnüsse", "Soja", "Milch", "Schalenfrüchte", "Sellerie", "Senf", "Sesam", "Sulfite", "Lupinen", "Weichtiere"];
export const ZUSATZSTOFFE_LISTE = ["Farbstoff", "Konservierungsstoff", "Antioxidationsmittel", "Geschmacksverstärker", "geschwefelt", "geschwärzt", "Phosphat", "Süßungsmittel", "enthält eine Phenylalaninquelle"];
/** DGE-"Lebenswelten" der Gemeinschaftsverpflegung. */
export const ZIELGRUPPEN_LISTE = ["Kita", "Schule", "Betriebsgastronomie", "Seniorenverpflegung", "Reha-/Klinikverpflegung"];
export const SCHWIERIGKEITSGRADE = ["Einfach", "Mittel", "Anspruchsvoll"] as const;

export const zutaten: Zutat[] = [
  { id: "z-001", name: "Kartoffeln, festkochend", artikelnummer: "ART-0101", kategorie: "Gemüse", basiseinheit: "kg", einkaufseinheit: "Sack (25 kg)", umrechnungsfaktor: 25, einkaufspreis: 21.5, lieferant: "Rheinland Frische GmbH", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 77, eiweissG: 2.0, fettG: 0.1, kohlenhydrateG: 15.6, zuckerG: 0.8, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-002", name: "Hähnchenbrustfilet", artikelnummer: "ART-0202", kategorie: "Fleisch & Geflügel", basiseinheit: "kg", einkaufseinheit: "Karton (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 68.9, lieferant: "Geflügelhof Brandt", allergene: [], zusatzstoffe: [], vegetarisch: false, vegan: false, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 110, eiweissG: 23.0, fettG: 1.5, kohlenhydrateG: 0, zuckerG: 0, salzG: 0.1, quelle: "USDA FoodData Central" } },
  { id: "z-003", name: "Vollmilch 3,5 %", artikelnummer: "ART-0303", kategorie: "Molkereiprodukte", basiseinheit: "l", einkaufseinheit: "Kiste (12 l)", umrechnungsfaktor: 12, einkaufspreis: 13.1, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], zusatzstoffe: [], vegetarisch: true, vegan: false, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 64, eiweissG: 3.3, fettG: 3.5, kohlenhydrateG: 4.8, zuckerG: 4.8, salzG: 0.13, quelle: "Open Food Facts" } },
  { id: "z-004", name: "Weizenmehl Type 405", artikelnummer: "ART-0404", kategorie: "Trockenware", basiseinheit: "kg", einkaufseinheit: "Sack (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 8.4, lieferant: "Mühle Reckmann", allergene: ["Gluten"], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 348, eiweissG: 10.0, fettG: 1.0, kohlenhydrateG: 72.0, zuckerG: 0.7, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-005", name: "Tomaten, passiert", artikelnummer: "ART-0505", kategorie: "Konserven", basiseinheit: "l", einkaufseinheit: "Karton (6 × 1 l)", umrechnungsfaktor: 6, einkaufspreis: 9.9, lieferant: "Bella Cucina Import", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 32, eiweissG: 1.4, fettG: 0.3, kohlenhydrateG: 5.3, zuckerG: 4.3, salzG: 0.35, quelle: "Open Food Facts" } },
  { id: "z-006", name: "Penne (Hartweizen)", artikelnummer: "ART-0606", kategorie: "Trockenware", basiseinheit: "kg", einkaufseinheit: "Karton (12 kg)", umrechnungsfaktor: 12, einkaufspreis: 17.8, lieferant: "Bella Cucina Import", allergene: ["Gluten"], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 359, eiweissG: 12.5, fettG: 1.8, kohlenhydrateG: 71.0, zuckerG: 3.2, salzG: 0.01, quelle: "Open Food Facts" } },
  { id: "z-007", name: "Rote Linsen", artikelnummer: "ART-0707", kategorie: "Hülsenfrüchte", basiseinheit: "kg", einkaufseinheit: "Sack (5 kg)", umrechnungsfaktor: 5, einkaufspreis: 12.2, lieferant: "BioGroß Handel", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: true, regional: false, aktiv: true, naehrwertePro100: { kcal: 343, eiweissG: 24.0, fettG: 1.9, kohlenhydrateG: 56.0, zuckerG: 1.9, salzG: 0.02, quelle: "USDA FoodData Central" } },
  { id: "z-008", name: "Sahne 30 %", artikelnummer: "ART-0808", kategorie: "Molkereiprodukte", basiseinheit: "l", einkaufseinheit: "Kiste (10 l)", umrechnungsfaktor: 10, einkaufspreis: 24.5, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], zusatzstoffe: [], vegetarisch: true, vegan: false, bio: false, regional: true, aktiv: false, naehrwertePro100: { kcal: 288, eiweissG: 2.4, fettG: 30.0, kohlenhydrateG: 3.2, zuckerG: 3.2, salzG: 0.08, quelle: "Open Food Facts" } },
  { id: "z-009", name: "Karotten", artikelnummer: "ART-0909", kategorie: "Gemüse", basiseinheit: "kg", einkaufseinheit: "Sack (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 9.8, lieferant: "Rheinland Frische GmbH", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: true, regional: true, aktiv: true, naehrwertePro100: { kcal: 41, eiweissG: 0.9, fettG: 0.2, kohlenhydrateG: 9.6, zuckerG: 4.7, salzG: 0.06, quelle: "Open Food Facts" } },
  { id: "z-010", name: "Zwiebeln", artikelnummer: "ART-1010", kategorie: "Gemüse", basiseinheit: "kg", einkaufseinheit: "Sack (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 7.5, lieferant: "Rheinland Frische GmbH", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 40, eiweissG: 1.1, fettG: 0.1, kohlenhydrateG: 9.3, zuckerG: 4.2, salzG: 0.0, quelle: "Open Food Facts" } },
  { id: "z-011", name: "Rinderhack", artikelnummer: "ART-1111", kategorie: "Fleisch & Geflügel", basiseinheit: "kg", einkaufseinheit: "Karton (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 74.0, lieferant: "Geflügelhof Brandt", allergene: [], zusatzstoffe: [], vegetarisch: false, vegan: false, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 176, eiweissG: 20.0, fettG: 10.0, kohlenhydrateG: 0, zuckerG: 0, salzG: 0.15, quelle: "USDA FoodData Central" } },
  { id: "z-012", name: "Lachsfilet, tiefgekühlt", artikelnummer: "ART-1212", kategorie: "Fisch", basiseinheit: "kg", einkaufseinheit: "Karton (5 kg)", umrechnungsfaktor: 5, einkaufspreis: 89.0, lieferant: "Nordsee Fischkontor", allergene: ["Fisch"], zusatzstoffe: [], vegetarisch: false, vegan: false, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 208, eiweissG: 20.4, fettG: 13.4, kohlenhydrateG: 0, zuckerG: 0, salzG: 0.08, quelle: "USDA FoodData Central" } },
  { id: "z-013", name: "Naturjoghurt", artikelnummer: "ART-1313", kategorie: "Molkereiprodukte", basiseinheit: "kg", einkaufseinheit: "Kübel (5 kg)", umrechnungsfaktor: 5, einkaufspreis: 9.9, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], zusatzstoffe: [], vegetarisch: true, vegan: false, bio: true, regional: true, aktiv: true, naehrwertePro100: { kcal: 61, eiweissG: 3.5, fettG: 3.0, kohlenhydrateG: 4.7, zuckerG: 4.7, salzG: 0.1, quelle: "Open Food Facts" } },
  { id: "z-014", name: "Eier, Freiland (Kl. M)", artikelnummer: "ART-1414", kategorie: "Eier & Frischware", basiseinheit: "Stück", einkaufseinheit: "Palette (360 Stück)", umrechnungsfaktor: 360, einkaufspreis: 108.0, lieferant: "Geflügelhof Brandt", allergene: ["Eier"], zusatzstoffe: [], vegetarisch: true, vegan: false, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 143, eiweissG: 12.6, fettG: 9.9, kohlenhydrateG: 0.7, zuckerG: 0.4, salzG: 0.37, quelle: "USDA FoodData Central" } },
  { id: "z-015", name: "Reis, Basmati", artikelnummer: "ART-1515", kategorie: "Trockenware", basiseinheit: "kg", einkaufseinheit: "Sack (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 19.5, lieferant: "Bella Cucina Import", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 349, eiweissG: 7.1, fettG: 0.7, kohlenhydrateG: 77.6, zuckerG: 0.1, salzG: 0.0, quelle: "USDA FoodData Central" } },
  { id: "z-016", name: "Kichererbsen", artikelnummer: "ART-1616", kategorie: "Hülsenfrüchte", basiseinheit: "kg", einkaufseinheit: "Sack (5 kg)", umrechnungsfaktor: 5, einkaufspreis: 13.9, lieferant: "BioGroß Handel", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: true, regional: false, aktiv: true, naehrwertePro100: { kcal: 364, eiweissG: 19.3, fettG: 6.0, kohlenhydrateG: 61.0, zuckerG: 10.7, salzG: 0.02, quelle: "USDA FoodData Central" } },
  { id: "z-017", name: "Äpfel, Elstar", artikelnummer: "ART-1717", kategorie: "Obst", basiseinheit: "kg", einkaufseinheit: "Kiste (12 kg)", umrechnungsfaktor: 12, einkaufspreis: 15.6, lieferant: "Rheinland Frische GmbH", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: true, regional: true, aktiv: true, naehrwertePro100: { kcal: 52, eiweissG: 0.3, fettG: 0.2, kohlenhydrateG: 13.8, zuckerG: 10.4, salzG: 0.0, quelle: "Open Food Facts" } },
  { id: "z-018", name: "Bananen", artikelnummer: "ART-1818", kategorie: "Obst", basiseinheit: "kg", einkaufseinheit: "Kiste (18 kg)", umrechnungsfaktor: 18, einkaufspreis: 21.6, lieferant: "Bella Cucina Import", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 89, eiweissG: 1.1, fettG: 0.3, kohlenhydrateG: 22.8, zuckerG: 12.2, salzG: 0.0, quelle: "USDA FoodData Central" } },
  { id: "z-019", name: "Butter", artikelnummer: "ART-1919", kategorie: "Molkereiprodukte", basiseinheit: "kg", einkaufseinheit: "Karton (10 kg)", umrechnungsfaktor: 10, einkaufspreis: 68.0, lieferant: "Molkerei Niederrhein", allergene: ["Milch"], zusatzstoffe: [], vegetarisch: true, vegan: false, bio: false, regional: true, aktiv: true, naehrwertePro100: { kcal: 717, eiweissG: 0.9, fettG: 81.0, kohlenhydrateG: 0.1, zuckerG: 0.1, salzG: 0.02, quelle: "Open Food Facts" } },
  { id: "z-020", name: "Sojasauce", artikelnummer: "ART-2020", kategorie: "Gewürze & Saucen", basiseinheit: "l", einkaufseinheit: "Kanister (5 l)", umrechnungsfaktor: 5, einkaufspreis: 22.5, lieferant: "Bella Cucina Import", allergene: ["Soja", "Gluten"], zusatzstoffe: ["Konservierungsstoff"], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true, naehrwertePro100: { kcal: 60, eiweissG: 6.0, fettG: 0.1, kohlenhydrateG: 8.0, zuckerG: 0.8, salzG: 14.0, quelle: "Manuell" } },
];

export const rezepte: Rezept[] = [
  {
    id: "r-001", name: "Penne al Pomodoro", beschreibung: "Klassische Pasta mit fruchtiger Tomatensauce und Basilikum.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 45, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Zwiebeln und Knoblauch anschwitzen.", "Passierte Tomaten zugeben, 20 Min. köcheln.", "Penne bissfest kochen.", "Sauce abschmecken und mit den Penne mischen."],
    zutaten: [ { zutatId: "z-006", menge: 1.2, einheit: "kg" }, { zutatId: "z-005", menge: 2, einheit: "l" }, { zutatId: "z-010", menge: 0.3, einheit: "kg" } ],
    vegetarisch: true, vegan: true, produktionshinweise: "Sauce kann am Vortag vorbereitet werden.", zielgruppen: ["Kita", "Schule", "Betriebsgastronomie"], lagerhinweis: "Gekühlt max. 2 Tage haltbar.", haltbarkeitNachZubereitung: "24 Stunden gekühlt", erstelltVon: "Petra Salomon", erstelltAm: "2026-02-14", aktualisiertAm: "2026-07-02", aktiv: true, version: 3,
  },
  {
    id: "r-002", name: "Hähnchengeschnetzeltes mit Kartoffeln", beschreibung: "Zartes Geschnetzeltes in heller Sauce mit Salzkartoffeln.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 60, schwierigkeit: "Mittel",
    zubereitungsschritte: ["Kartoffeln schälen und garen.", "Hähnchen in Streifen schneiden und anbraten.", "Sauce mit Milch aufgießen und binden.", "Alles zusammenführen und heiß halten."],
    zutaten: [ { zutatId: "z-002", menge: 1.5, einheit: "kg" }, { zutatId: "z-001", menge: 2.5, einheit: "kg" }, { zutatId: "z-003", menge: 0.8, einheit: "l" } ],
    vegetarisch: false, vegan: false, zielgruppen: ["Schule", "Betriebsgastronomie", "Seniorenverpflegung"], kerntemperaturC: 72, lagerhinweis: "Nur frisch ausgeben, keine Wiederaufwärmung.", erstelltVon: "Petra Salomon", erstelltAm: "2026-01-20", aktualisiertAm: "2026-06-11", aktiv: true, version: 5,
  },
  {
    id: "r-003", name: "Rote-Linsen-Curry", beschreibung: "Mildes Curry mit roten Linsen, Kokosnote und Reis.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 50, schwierigkeit: "Mittel",
    zubereitungsschritte: ["Linsen waschen.", "Gewürze anrösten, Linsen zugeben.", "Mit Flüssigkeit aufgießen und garen.", "Abschmecken und servieren."],
    zutaten: [ { zutatId: "z-007", menge: 1.4, einheit: "kg" }, { zutatId: "z-005", menge: 1, einheit: "l" }, { zutatId: "z-015", menge: 1.5, einheit: "kg" } ],
    vegetarisch: true, vegan: true, produktionshinweise: "Milde Würzung für Schulen beachten.", zielgruppen: ["Kita", "Schule"], haltbarkeitNachZubereitung: "24 Stunden gekühlt", erstelltVon: "Ali Demir", erstelltAm: "2026-03-05", aktiv: true, version: 2,
  },
  {
    id: "r-004", name: "Pfannkuchen mit Apfelmus", beschreibung: "Süßer Klassiker, beliebt bei Kita und Grundschule.", kategorie: "Süßspeise", standardPortionen: 10, zubereitungszeitMin: 40, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Teig aus Mehl, Milch und Eiern anrühren.", "Pfannkuchen portionsweise ausbacken.", "Mit Apfelmus anrichten."],
    zutaten: [ { zutatId: "z-004", menge: 1, einheit: "kg" }, { zutatId: "z-003", menge: 1.5, einheit: "l" }, { zutatId: "z-014", menge: 12, einheit: "Stück" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Kita", "Schule"], erstelltVon: "Ali Demir", erstelltAm: "2026-01-09", aktiv: true, version: 1,
  },
  {
    id: "r-005", name: "Karotten-Linsen-Suppe", beschreibung: "Wärmende Gemüsesuppe mit roten Linsen, ideal für kühle Tage.", kategorie: "Suppe", standardPortionen: 10, zubereitungszeitMin: 35, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Zwiebeln und Karotten anschwitzen.", "Linsen zugeben, mit Brühe aufgießen.", "20 Min. köcheln lassen und pürieren."],
    zutaten: [ { zutatId: "z-009", menge: 2, einheit: "kg" }, { zutatId: "z-010", menge: 0.4, einheit: "kg" }, { zutatId: "z-007", menge: 0.8, einheit: "kg" } ],
    vegetarisch: true, vegan: true, zielgruppen: ["Kita", "Schule", "Seniorenverpflegung"], haltbarkeitNachZubereitung: "48 Stunden gekühlt", erstelltVon: "Miriam Hoffmann", erstelltAm: "2026-04-11", aktiv: true, version: 2,
  },
  {
    id: "r-006", name: "Bunter Blattsalat mit Joghurtdressing", beschreibung: "Frischer Salat mit leichtem Joghurt-Kräuterdressing.", kategorie: "Vorspeise/Salat", standardPortionen: 10, zubereitungszeitMin: 20, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Salat waschen und zupfen.", "Dressing aus Joghurt und Kräutern anrühren.", "Kurz vor Ausgabe marinieren."],
    zutaten: [ { zutatId: "z-013", menge: 1.5, einheit: "kg" }, { zutatId: "z-009", menge: 1, einheit: "kg" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Betriebsgastronomie", "Seniorenverpflegung"], haltbarkeitNachZubereitung: "6 Stunden gekühlt", erstelltVon: "Jan Berger", erstelltAm: "2026-05-02", aktiv: true, version: 1,
  },
  {
    id: "r-007", name: "Rührei mit Vollkornbrot", beschreibung: "Herzhaftes Frühstück mit frischen Eiern.", kategorie: "Frühstück", standardPortionen: 10, zubereitungszeitMin: 15, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Eier verquirlen, würzen.", "In Butter langsam stocken lassen.", "Mit Vollkornbrot servieren."],
    zutaten: [ { zutatId: "z-014", menge: 20, einheit: "Stück" }, { zutatId: "z-019", menge: 0.3, einheit: "kg" }, { zutatId: "z-004", menge: 0.5, einheit: "kg" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Kita", "Seniorenverpflegung", "Reha-/Klinikverpflegung"], kerntemperaturC: 70, erstelltVon: "Petra Salomon", erstelltAm: "2026-02-27", aktiv: true, version: 1,
  },
  {
    id: "r-008", name: "Lachsfilet mit Basmatireis und Gemüse", beschreibung: "Gedämpftes Lachsfilet mit Reis und buntem Gemüse.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 55, schwierigkeit: "Anspruchsvoll",
    zubereitungsschritte: ["Lachs würzen, im Ofen garen.", "Reis nach Packungsanweisung kochen.", "Gemüse dünsten und anrichten."],
    zutaten: [ { zutatId: "z-012", menge: 2, einheit: "kg" }, { zutatId: "z-015", menge: 1.5, einheit: "kg" }, { zutatId: "z-009", menge: 1, einheit: "kg" } ],
    vegetarisch: false, vegan: false, zielgruppen: ["Betriebsgastronomie", "Seniorenverpflegung"], kerntemperaturC: 65, lagerhinweis: "Tiefgekühlte Ware nur einmal auftauen.", produktionshinweise: "Gräten vor Zubereitung kontrollieren.", erstelltVon: "Ali Demir", erstelltAm: "2026-05-19", aktiv: true, version: 1,
  },
  {
    id: "r-009", name: "Rinderhack-Bolognese mit Penne", beschreibung: "Klassische Bolognese mit magerem Rinderhack.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 65, schwierigkeit: "Mittel",
    zubereitungsschritte: ["Zwiebeln anschwitzen, Hack scharf anbraten.", "Tomaten zugeben, 30 Min. köcheln.", "Penne bissfest kochen und mischen."],
    zutaten: [ { zutatId: "z-011", menge: 2, einheit: "kg" }, { zutatId: "z-005", menge: 2, einheit: "l" }, { zutatId: "z-006", menge: 1.2, einheit: "kg" }, { zutatId: "z-010", menge: 0.3, einheit: "kg" } ],
    vegetarisch: false, vegan: false, zielgruppen: ["Schule", "Betriebsgastronomie"], kerntemperaturC: 75, erstelltVon: "Jan Berger", erstelltAm: "2026-03-21", aktualisiertAm: "2026-07-15", aktiv: true, version: 4,
  },
  {
    id: "r-010", name: "Kichererbsen-Bowl mit Karotten", beschreibung: "Vegane Bowl mit Kichererbsen, Karotten und Reis.", kategorie: "Hauptgericht", standardPortionen: 10, zubereitungszeitMin: 40, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Kichererbsen abtropfen und würzen.", "Karotten raspeln.", "Mit Reis anrichten."],
    zutaten: [ { zutatId: "z-016", menge: 1.6, einheit: "kg" }, { zutatId: "z-009", menge: 1.2, einheit: "kg" }, { zutatId: "z-015", menge: 1.5, einheit: "kg" }, { zutatId: "z-020", menge: 0.2, einheit: "l" } ],
    vegetarisch: true, vegan: true, zielgruppen: ["Betriebsgastronomie", "Schule"], erstelltVon: "Miriam Hoffmann", erstelltAm: "2026-06-08", aktiv: true, version: 1,
  },
  {
    id: "r-011", name: "Obstsalat mit Joghurt", beschreibung: "Frischer Obstsalat mit einem Klecks Naturjoghurt.", kategorie: "Snack", standardPortionen: 10, zubereitungszeitMin: 15, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Obst waschen, schälen und würfeln.", "Mit Joghurt vermengen und portionieren."],
    zutaten: [ { zutatId: "z-017", menge: 1.5, einheit: "kg" }, { zutatId: "z-018", menge: 1, einheit: "kg" }, { zutatId: "z-013", menge: 0.5, einheit: "kg" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Kita", "Schule"], haltbarkeitNachZubereitung: "4 Stunden gekühlt", erstelltVon: "Petra Salomon", erstelltAm: "2026-04-30", aktiv: true, version: 1,
  },
  {
    id: "r-012", name: "Kartoffelpüree", beschreibung: "Cremiges Püree als klassische Beilage.", kategorie: "Beilage", standardPortionen: 10, zubereitungszeitMin: 30, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Kartoffeln schälen und garen.", "Mit Milch und Butter stampfen.", "Abschmecken."],
    zutaten: [ { zutatId: "z-001", menge: 3, einheit: "kg" }, { zutatId: "z-003", menge: 0.5, einheit: "l" }, { zutatId: "z-019", menge: 0.2, einheit: "kg" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Kita", "Schule", "Seniorenverpflegung"], erstelltVon: "Ali Demir", erstelltAm: "2026-02-02", aktiv: true, version: 2,
  },
  {
    id: "r-013", name: "Milchreis mit Zimt", beschreibung: "Sanfter Milchreis, beliebt in der Seniorenverpflegung.", kategorie: "Süßspeise", standardPortionen: 10, zubereitungszeitMin: 45, schwierigkeit: "Einfach",
    zubereitungsschritte: ["Reis in Milch quellen lassen, gelegentlich rühren.", "Mit Zimt und Zucker abschmecken."],
    zutaten: [ { zutatId: "z-015", menge: 1, einheit: "kg" }, { zutatId: "z-003", menge: 4, einheit: "l" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Seniorenverpflegung", "Reha-/Klinikverpflegung"], lagerhinweis: "Warm halten bei mind. 65 °C.", erstelltVon: "Jan Berger", erstelltAm: "2026-01-15", aktiv: true, version: 1,
  },
  {
    id: "r-014", name: "Gemüse-Wrap", beschreibung: "Handlicher Snack mit buntem Gemüse, ideal für unterwegs.", kategorie: "Snack", standardPortionen: 10, zubereitungszeitMin: 25, schwierigkeit: "Mittel",
    zubereitungsschritte: ["Gemüse in Streifen schneiden.", "Wraps mit Joghurtdip bestreichen.", "Füllen, rollen und halbieren."],
    zutaten: [ { zutatId: "z-009", menge: 0.8, einheit: "kg" }, { zutatId: "z-013", menge: 0.6, einheit: "kg" }, { zutatId: "z-004", menge: 0.6, einheit: "kg" } ],
    vegetarisch: true, vegan: false, zielgruppen: ["Schule", "Betriebsgastronomie"], haltbarkeitNachZubereitung: "6 Stunden gekühlt", erstelltVon: "Miriam Hoffmann", erstelltAm: "2026-06-25", aktiv: true, version: 1,
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
  {
    id: "b-0992", einrichtungId: "f-002", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 08:50", frist: "Vortag, 09:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-002", portionen: 95 }, { datum: "2026-07-31", rezeptId: "r-001", portionen: 60 } ],
  },
  {
    id: "b-0993", einrichtungId: "f-003", speiseplanId: "mp-031", status: "LOCKED", abgesendetAm: "2026-07-27, 07:40", frist: "Vortag, 08:00 Uhr",
    positionen: [ { datum: "2026-07-30", rezeptId: "r-003", portionen: 30 } ],
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

const SPEISEPLAN_STATUS_SICHTBAR: SpeiseplanStatus[] = ["PUBLISHED", "CLOSED", "ARCHIVED"];

/** Sichtbare Speisepläne einer Einrichtung, neueste Woche zuerst. */
export const speiseplaeneByEinrichtung = (einrichtungId: string): Speiseplan[] =>
  speiseplaene
    .filter((p) => p.einrichtungIds.includes(einrichtungId) && SPEISEPLAN_STATUS_SICHTBAR.includes(p.status))
    .sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche);

/** Bestellung einer Einrichtung zu einem bestimmten Speiseplan (falls vorhanden). */
export const bestellungByEinrichtungUndPlan = (einrichtungId: string, speiseplanId: string) =>
  bestellungen.find((b) => b.einrichtungId === einrichtungId && b.speiseplanId === speiseplanId);

/** Allergene eines Rezepts werden automatisch aus den Zutaten ermittelt. */
export const rezeptAllergene = (r: Rezept): string[] => {
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatById(rz.zutatId)?.allergene.forEach((a) => set.add(a)));
  return [...set];
};

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

/** Flache Umsatz-Reporting-Zeilen je zählender Bestellung, verknüpft mit Woche/Einrichtung/Standort. */
export const umsatzUebersicht = (): UmsatzZeile[] =>
  bestellungen
    .filter(bestellungZaehltAlsUmsatz)
    .map((b) => {
      const plan = speiseplaene.find((p) => p.id === b.speiseplanId);
      const einrichtung = einrichtungById(b.einrichtungId);
      const standort = einrichtung ? standortById(einrichtung.standortId) : undefined;
      return {
        bestellungId: b.id,
        speiseplanId: b.speiseplanId,
        kalenderwoche: plan?.kalenderwoche ?? 0,
        jahr: plan?.jahr ?? 0,
        einrichtungId: b.einrichtungId,
        einrichtungName: einrichtung?.name ?? "—",
        standortId: einrichtung?.standortId ?? "",
        standortName: standort?.name ?? "—",
        portionen: bestellungPortionenGesamt(b),
        portionspreis: einrichtung?.portionspreis ?? 0,
        umsatz: bestellungUmsatz(b),
      };
    })
    .sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche);

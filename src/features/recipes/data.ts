import { zutatById } from "@/features/ingredients/data";
import type { Rezept } from "./types";

/** Feste Auswahllisten für Formulare und Filter. */
export const REZEPT_KATEGORIEN = ["Hauptgericht", "Beilage", "Suppe", "Vorspeise/Salat", "Süßspeise", "Frühstück", "Snack"];
/** DGE-"Lebenswelten" der Gemeinschaftsverpflegung. */
export const ZIELGRUPPEN_LISTE = ["Kita", "Schule", "Betriebsgastronomie", "Seniorenverpflegung", "Reha-/Klinikverpflegung"];
export const SCHWIERIGKEITSGRADE = ["Einfach", "Mittel", "Anspruchsvoll"] as const;

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

export const rezeptById = (id: string) => rezepte.find((r) => r.id === id);

/** Allergene eines Rezepts werden automatisch aus den Zutaten ermittelt. */
export const rezeptAllergene = (r: Rezept): string[] => {
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatById(rz.zutatId)?.allergene.forEach((a) => set.add(a)));
  return [...set];
};

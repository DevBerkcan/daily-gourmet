import { bestellungen, bestellungZaehltAlsUmsatz, einrichtungById } from "@/lib/data";
import type { ProduktionsPlan } from "./types";

export const produktionsplaene: ProduktionsPlan[] = [
  {
    id: "pp-0806", datum: "2026-08-06", standortId: "s-001",
    positionen: [
      { rezeptId: "r-088", bestellteMenge: 243, zusatzMenge: 12, status: "PREPARING", begruendung: "Erfahrungswert Nachbestellungen Musterschule Nord" },
      { rezeptId: "r-001", bestellteMenge: 60, zusatzMenge: 0, status: "PLANNED" },
    ],
  },
  {
    id: "pp-0807", datum: "2026-08-07", standortId: "s-001",
    positionen: [
      { rezeptId: "r-037", bestellteMenge: 210, zusatzMenge: 10, status: "PLANNED", begruendung: "Sicherheitsmenge Freitag" },
      { rezeptId: "r-024", bestellteMenge: 77, zusatzMenge: 5, status: "PLANNED" },
    ],
  },
];

/** Eindeutige Liefertage mit zählenden Bestellungen für Einrichtungen eines Standorts, sortiert. */
export const bestelldatenJeStandort = (standortId: string): string[] => {
  const set = new Set<string>();
  bestellungen
    .filter((b) => bestellungZaehltAlsUmsatz(b) && einrichtungById(b.einrichtungId)?.standortId === standortId)
    .forEach((b) => b.positionen.forEach((p) => set.add(p.datum)));
  return [...set].sort();
};

/** Über alle Einrichtungen eines Standorts summierte Bestellmenge je Rezept für einen Liefertag. */
export const bestellteMengeProTagUndStandort = (datum: string, standortId: string): { rezeptId: string; menge: number }[] => {
  const mengen = new Map<string, number>();
  bestellungen
    .filter((b) => bestellungZaehltAlsUmsatz(b) && einrichtungById(b.einrichtungId)?.standortId === standortId)
    .forEach((b) => b.positionen.forEach((p) => {
      if (p.datum !== datum) return;
      mengen.set(p.rezeptId, (mengen.get(p.rezeptId) ?? 0) + p.portionen);
    }));
  return [...mengen.entries()].map(([rezeptId, menge]) => ({ rezeptId, menge }));
};

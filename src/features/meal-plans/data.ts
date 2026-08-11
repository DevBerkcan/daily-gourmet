import { bestellungen, bestellungPortionenGesamt, bestellungUmsatz, bestellungZaehltAlsUmsatz, einrichtungById, standortById } from "@/lib/data";
import type { Speiseplan, SpeiseplanStatus, UmsatzZeile } from "./types";

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
    id: "mp-033", kalenderwoche: 33, jahr: 2026, status: "REVIEW", standortIds: ["s-001"], einrichtungIds: ["f-001", "f-002"],
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

const SPEISEPLAN_STATUS_SICHTBAR: SpeiseplanStatus[] = ["PUBLISHED", "CLOSED", "ARCHIVED"];

/** Sichtbare Speisepläne einer Einrichtung, neueste Woche zuerst. */
export const speiseplaeneByEinrichtung = (einrichtungId: string): Speiseplan[] =>
  speiseplaene
    .filter((p) => p.einrichtungIds.includes(einrichtungId) && SPEISEPLAN_STATUS_SICHTBAR.includes(p.status))
    .sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche);

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

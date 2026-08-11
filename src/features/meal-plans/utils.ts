import { weekdayDatesOfIsoWeek } from "@/lib/isoWeek";
import type { SpeiseplanTag } from "./types";

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

/** Erzeugt leere Speiseplan-Tage (Mo–Fr, ohne Rezepte) für eine Kalenderwoche. */
export function generateWeekTage(week: number, year: number): SpeiseplanTag[] {
  const dates = weekdayDatesOfIsoWeek(week, year);
  return WOCHENTAGE.map((wochentag, i) => ({ wochentag, datum: dates[i], rezeptIds: [] }));
}

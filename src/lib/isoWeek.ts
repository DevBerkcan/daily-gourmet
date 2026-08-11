const toIsoDateString = (d: Date) => d.toISOString().slice(0, 10);

/** ISO-8601-Kalenderwoche und -Jahr für ein Datum (UTC, verschiebt auf den Donnerstag der Woche). */
export function isoWeekInfo(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNr = (d.getUTCDay() + 6) % 7; // Montag = 0
  d.setUTCDate(d.getUTCDate() - dayNr + 3); // auf Donnerstag derselben Woche
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { week, year: d.getUTCFullYear() };
}

/** Anzahl ISO-Kalenderwochen eines Jahres (52 oder 53). */
export function isoWeeksInYear(year: number): number {
  const p = (y: number) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
  return p(year) === 4 || p(year - 1) === 3 ? 53 : 52;
}

/** Montag einer gegebenen ISO-Kalenderwoche. */
export function mondayOfIsoWeek(week: number, year: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4DayNr = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4DayNr);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return monday;
}

/** Die 5 ISO-Datumsstrings (Mo–Fr) einer Kalenderwoche. */
export function weekdayDatesOfIsoWeek(week: number, year: number): string[] {
  const monday = mondayOfIsoWeek(week, year);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return toIsoDateString(d);
  });
}

/**
 * Die nächsten `count` Kalenderwochen ab (ausschließlich) der Woche von `referenceDateISO`,
 * unter Auslassung bereits vergebener `${jahr}-${kalenderwoche}`-Kombinationen.
 */
export function nextUpcomingWeeks(
  referenceDateISO: string,
  takenKeys: Set<string>,
  count: number
): { kalenderwoche: number; jahr: number }[] {
  const result: { kalenderwoche: number; jahr: number }[] = [];
  let { week, year } = isoWeekInfo(new Date(referenceDateISO));

  while (result.length < count) {
    week += 1;
    if (week > isoWeeksInYear(year)) {
      week = 1;
      year += 1;
    }
    const key = `${year}-${week}`;
    if (!takenKeys.has(key)) {
      result.push({ kalenderwoche: week, jahr: year });
    }
  }
  return result;
}

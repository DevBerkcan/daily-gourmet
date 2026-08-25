/**
 * Zentraler Referenzpunkt für „heute" in diesem Datenstand — alle Seed-/Demo-Daten (Bestellungen,
 * Speisepläne, Fahrer-Routen) sind auf dieses Datum ausgerichtet. Einzige Stelle, die bei einem
 * neuen Datenstand angepasst werden muss; alle anderen Stellen im Code importieren von hier statt
 * das Datum erneut hart zu codieren.
 */
export const HEUTE = "2026-08-06";

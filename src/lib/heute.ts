/**
 * Zentraler Referenzpunkt für „heute" (YYYY-MM-DD, lokale Zeit des Browsers). War früher fest auf
 * den Demo-Datenstand 2026-08-06 gesetzt — dadurch waren u. a. Fahrer-Pool, Tagesanpassung und
 * KW-Anzeige auf diesen Tag eingefroren. Bewusst toLocaleDateString("sv-SE") statt toISOString(),
 * das UTC liefert und nachts auf den Vortag kippt. Alle Stellen importieren von hier.
 */
export const HEUTE = new Date().toLocaleDateString("sv-SE");

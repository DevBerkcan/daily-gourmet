import type { Rezept, RezeptNaehrwerte100 } from "./types";
import type { Zutat } from "@/lib/services/ingredients";

/* ---------- Live-Berechnungshelfer (arbeiten auf der aktuell geladenen Zutatenliste) ---------- */

function zutatByIdIn(zutaten: Zutat[], id: string) {
  return zutaten.find((z) => z.id === id);
}

/**
 * Bevorzugt die importierten, authoritativen Allergene (`allergeneErfasst`) — nur wenn ein
 * Rezept keine hat (z. B. manuell im Admin angelegt), wird live aus den Zutaten ermittelt.
 * Siehe Kommentar an `Rezept.naehrwertePro100g` in `./types.ts` für die Begründung.
 */
export const rezeptAllergeneLive = (r: Rezept, zutaten: Zutat[]): string[] => {
  if (r.allergeneErfasst) return r.allergeneErfasst;
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatByIdIn(zutaten, rz.zutatId)?.allergene.forEach((a) => set.add(a)));
  return [...set];
};

export const rezeptZusatzstoffeLive = (r: Rezept, zutaten: Zutat[]): string[] => {
  if (r.zusatzstoffeErfasst) return r.zusatzstoffeErfasst;
  const set = new Set<string>();
  r.zutaten.forEach((rz) => zutatByIdIn(zutaten, rz.zutatId)?.zusatzstoffe.forEach((a) => set.add(a)));
  return [...set];
};

/** Skaliert einen vollständigen 100-g-Nährwertsatz auf ein gegebenes Portionsgewicht (g). */
export function naehrwerteProPortion(n: RezeptNaehrwerte100, portionsgewichtG: number): RezeptNaehrwerte100 {
  const faktor = portionsgewichtG / 100;
  return {
    kcal: Math.round(n.kcal * faktor),
    kj: Math.round(n.kj * faktor),
    fettG: Math.round(n.fettG * faktor * 10) / 10,
    gesFettSaeurenG: Math.round(n.gesFettSaeurenG * faktor * 10) / 10,
    kohlenhydrateG: Math.round(n.kohlenhydrateG * faktor * 10) / 10,
    zuckerG: Math.round(n.zuckerG * faktor * 10) / 10,
    ballaststoffeG: Math.round(n.ballaststoffeG * faktor * 10) / 10,
    eiweissG: Math.round(n.eiweissG * faktor * 10) / 10,
    salzG: Math.round(n.salzG * faktor * 100) / 100,
    alkoholG: Math.round(n.alkoholG * faktor * 10) / 10,
  };
}

const MASSE_FAKTOR: Record<string, number> = { kg: 1, l: 1, g: 0.001, ml: 0.001 };

/** Massenanteil (%) der Zutaten mit dem gegebenen Flag (bio/regional) am Gesamtgewicht des Rezepts. */
function anteilByFlag(r: Rezept, zutaten: Zutat[], flag: "bio" | "regional"): number {
  let gesamt = 0;
  let markiert = 0;
  r.zutaten.forEach((rz) => {
    const faktor = MASSE_FAKTOR[rz.einheit];
    if (!faktor) return; // Stück-Mengen fließen nicht in die Massenberechnung ein
    const masse = rz.menge * faktor;
    gesamt += masse;
    if (zutatByIdIn(zutaten, rz.zutatId)?.[flag]) markiert += masse;
  });
  return gesamt > 0 ? Math.round((markiert / gesamt) * 100) : 0;
}

export const rezeptBioAnteilLive = (r: Rezept, zutaten: Zutat[]): number => anteilByFlag(r, zutaten, "bio");
export const rezeptRegionalAnteilLive = (r: Rezept, zutaten: Zutat[]): number => anteilByFlag(r, zutaten, "regional");

/** Wareneinsatz (Zutatenkosten) gesamt und je Portion, auf Basis der Einkaufspreise. */
export function rezeptWareneinsatzLive(r: Rezept, zutaten: Zutat[]): { gesamt: number; proPortion: number } {
  let gesamt = 0;
  r.zutaten.forEach((rz) => {
    const z = zutatByIdIn(zutaten, rz.zutatId);
    if (!z || z.einkaufspreis == null || z.umrechnungsfaktor === 0) return;
    gesamt += rz.menge * (z.einkaufspreis / z.umrechnungsfaktor);
  });
  const proPortion = r.standardPortionen > 0 ? gesamt / r.standardPortionen : 0;
  return { gesamt: Math.round(gesamt * 100) / 100, proPortion: Math.round(proPortion * 100) / 100 };
}

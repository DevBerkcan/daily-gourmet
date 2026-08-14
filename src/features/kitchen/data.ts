import { einrichtungById } from "@/lib/data";
import { produktionsplaene } from "@/features/production/data";
import { zutatById } from "@/features/ingredients/data";
import { rezeptById } from "@/features/recipes/data";
import { lieferRoutenSeed } from "@/features/logistics/data";
import type { GesamtbedarfPosition, KitchenWorkStatus, ProduktionsMetaEintrag } from "./types";

export const workStatusOrder: KitchenWorkStatus[] = ["OFFEN", "BEREITSTELLUNG", "ZUBEREITUNG", "FERTIG", "VERPACKT", "ABHOLBEREIT"];

export const workStatusLabel: Record<KitchenWorkStatus, string> = {
  OFFEN: "Offen",
  BEREITSTELLUNG: "Zutaten bereitstellen",
  ZUBEREITUNG: "In Zubereitung",
  FERTIG: "Fertig",
  VERPACKT: "Verpackt",
  ABHOLBEREIT: "Abholbereit",
};

export const produktionsMeta: Record<string, ProduktionsMetaEintrag> = {
  "r-088": { start: "06:30", fertigBis: "10:15", arbeitsplatz: "Warmküche 1", geraet: "Kochkessel 1", chargen: 3, portionenJeCharge: 85, verantwortung: "Ali Demir", varianten: ["12 Reserveportionen", "vegan"] },
  "r-001": { start: "07:15", fertigBis: "10:30", arbeitsplatz: "Warmküche 2", geraet: "Kombidämpfer 2", chargen: 2, portionenJeCharge: 30, verantwortung: "Petra Salomon", varianten: ["vegetarisch"] },
  "r-037": { start: "06:15", fertigBis: "10:00", arbeitsplatz: "Warmküche 1", geraet: "Kippbratpfanne", chargen: 3, portionenJeCharge: 74, verantwortung: "Ali Demir", varianten: ["10 Portionen ohne Sauce"] },
  "r-024": { start: "07:00", fertigBis: "10:20", arbeitsplatz: "Warmküche 2", geraet: "Kochkessel 2", chargen: 2, portionenJeCharge: 41, verantwortung: "Petra Salomon", varianten: ["vegan", "5 Reserveportionen"] },
};

const PRODUKTIONS_META_FALLBACK: Omit<ProduktionsMetaEintrag, "portionenJeCharge"> = {
  start: "06:30",
  fertigBis: "10:30",
  arbeitsplatz: "Warmküche",
  geraet: "Kochkessel",
  chargen: 1,
  verantwortung: "—",
  varianten: [],
};

/**
 * Für Rezepte ohne hinterlegte Küchen-Metadaten (aktuell nur die vier Gerichte im
 * Speiseplan der laufenden Woche gepflegt, siehe `produktionsMeta` oben) wird ein
 * generischer Platzhalter statt `undefined` geliefert — verhindert leere Felder in
 * der Küchenansicht für die übrigen importierten Rezepte.
 */
export function produktionsMetaFuer(rezeptId: string, standardPortionen: number): ProduktionsMetaEintrag {
  return produktionsMeta[rezeptId] ?? { ...PRODUKTIONS_META_FALLBACK, portionenJeCharge: standardPortionen };
}

export const aenderungen = [
  { id: "chg-1", zeit: "08:42", titel: "+15 Portionen Vollkorn Penne mit Tomaten-Kräutersauce", text: "Musterschule Nord hat telefonisch nachbestellt.", tone: "warn" as const },
  { id: "chg-2", zeit: "07:55", titel: "Ausgabezeit geändert", text: "Kita Sonnenblume holt heute um 10:45 Uhr ab.", tone: "info" as const },
];

export const geraeteBelegung = [
  { zeit: "06:30–08:00", geraet: "Kochkessel 1", rezeptId: "r-088", charge: "Charge 1–2" },
  { zeit: "08:00–09:00", geraet: "Kochkessel 1", rezeptId: "r-088", charge: "Charge 3" },
  { zeit: "07:15–08:20", geraet: "Kombidämpfer 2", rezeptId: "r-001", charge: "Charge 1" },
  { zeit: "08:25–09:30", geraet: "Kombidämpfer 2", rezeptId: "r-001", charge: "Charge 2" },
];

export const verpackungsPositionen = lieferRoutenSeed.flatMap((route) => route.stopps.flatMap((stopp) => stopp.positionen.map((position) => ({ ...position, einrichtungId: stopp.einrichtungId, ausgabe: stopp.ankunft, hinweis: route.name }))));

export const kontrollenSeed = [
  { id: "ctrl-1", zeit: "07:10", art: "Wareneingang", bereich: "Kühlung", soll: "max. 7 °C", ist: "4,2 °C", person: "Petra Salomon", status: "OK" as const },
  { id: "ctrl-2", zeit: "08:35", art: "Kerntemperatur", bereich: "Vollkorn Penne mit Tomaten-Kräutersauce · Charge 1", soll: "mind. 75 °C", ist: "78,4 °C", person: "Ali Demir", status: "OK" as const },
];

export const abweichungenSeed = [
  { id: "dev-1", zeit: "07:48", kategorie: "Fehlbestand", betreff: "Frische Petersilie", menge: "0,8 kg fehlen", massnahme: "TK-Petersilie nach Freigabe verwendet", person: "Petra Salomon", status: "GEKLÄRT" as const },
  { id: "dev-2", zeit: "09:05", kategorie: "Produktionsmenge", betreff: "Vollkorn Penne mit Tomaten-Kräutersauce", menge: "+15 Portionen", massnahme: "Zusätzliche Charge eingeplant", person: "Ali Demir", status: "OFFEN" as const },
];

const lagerorte: Record<string, string> = {
  Gemüse: "Kühlhaus 1",
  Molkereiprodukte: "Kühlhaus 2",
  Fleisch: "Kühlhaus 3",
  Trockenwaren: "Trockenlager",
  Gewürze: "Gewürzregal",
};

export function gesamtbedarfFuerPlan(planId: string): GesamtbedarfPosition[] {
  const plan = produktionsplaene.find((eintrag) => eintrag.id === planId);
  if (!plan) return [];
  const bedarf = new Map<string, GesamtbedarfPosition>();

  for (const position of plan.positionen) {
    const rezept = rezeptById(position.rezeptId);
    if (!rezept) continue;
    const faktor = (position.bestellteMenge + position.zusatzMenge) / rezept.standardPortionen;
    for (const rz of rezept.zutaten) {
      const zutat = zutatById(rz.zutatId);
      if (!zutat) continue;
      const key = `${rz.zutatId}-${rz.einheit}`;
      const vorhanden = bedarf.get(key);
      const menge = rz.menge * faktor;
      if (vorhanden) {
        vorhanden.menge += menge;
        if (!vorhanden.rezepte.includes(rezept.name)) vorhanden.rezepte.push(rezept.name);
      } else {
        bedarf.set(key, {
          zutatId: rz.zutatId,
          name: zutat.name,
          menge,
          einheit: rz.einheit,
          kategorie: zutat.kategorie,
          lagerort: lagerorte[zutat.kategorie] ?? "Hauptlager",
          bereitgestellt: rz.zutatId === "z-107" ? menge * 0.72 : menge,
          rezepte: [rezept.name],
          allergene: zutat.allergene,
        });
      }
    }
  }

  return [...bedarf.values()].sort((a, b) => a.lagerort.localeCompare(b.lagerort) || a.name.localeCompare(b.name));
}

export function einrichtungsName(id: string | null) {
  return id ? einrichtungById(id)?.name ?? id : "Küchenreserve";
}

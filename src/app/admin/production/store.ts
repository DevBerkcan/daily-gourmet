import { useSyncExternalStore } from "react";
import { produktionsplaene, bestellteMengeProTagUndStandort } from "@/lib/data";
import type { ProduktionsPlan, ProduktionsPosition } from "@/lib/types";

/**
 * Session-Store für im Admin erstellte/bearbeitete Produktionspläne (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
let plaene: ProduktionsPlan[] = produktionsplaene.map((p) => ({ ...p, positionen: p.positionen.map((pos) => ({ ...pos })) }));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return plaene;
}

function positionenAusBestellungen(datum: string, standortId: string): ProduktionsPosition[] {
  return bestellteMengeProTagUndStandort(datum, standortId).map(({ rezeptId, menge }) => ({
    rezeptId,
    bestellteMenge: menge,
    zusatzMenge: 0,
    status: "PLANNED",
  }));
}

export function addPlan(input: { datum: string; standortId: string }): ProduktionsPlan {
  const neuerPlan: ProduktionsPlan = {
    id: `pp-${input.datum}-${input.standortId}`,
    datum: input.datum,
    standortId: input.standortId,
    positionen: positionenAusBestellungen(input.datum, input.standortId),
  };
  plaene = [neuerPlan, ...plaene];
  emit();
  return neuerPlan;
}

export function updatePosition(planId: string, rezeptId: string, updates: Partial<Pick<ProduktionsPosition, "zusatzMenge" | "begruendung" | "status">>) {
  plaene = plaene.map((p) =>
    p.id !== planId
      ? p
      : { ...p, positionen: p.positionen.map((pos) => (pos.rezeptId !== rezeptId ? pos : { ...pos, ...updates })) }
  );
  emit();
}

/** Berechnet bestellteMenge je Position neu aus den aktuellen Bestellungen, behält Zusatzmenge/Status/Begründung. */
export function refreshBestellmengen(planId: string) {
  plaene = plaene.map((p) => {
    if (p.id !== planId) return p;
    const aktuelleMengen = new Map(bestellteMengeProTagUndStandort(p.datum, p.standortId).map((m) => [m.rezeptId, m.menge]));
    return { ...p, positionen: p.positionen.map((pos) => ({ ...pos, bestellteMenge: aktuelleMengen.get(pos.rezeptId) ?? pos.bestellteMenge })) };
  });
  emit();
}

export function useProduktionsplaene(): ProduktionsPlan[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

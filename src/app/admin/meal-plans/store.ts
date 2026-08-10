import { useSyncExternalStore } from "react";
import { speiseplaene } from "@/lib/data";
import { generateWeekTage } from "@/lib/isoWeek";
import type { Speiseplan } from "@/lib/types";

/**
 * Session-Store für im Admin erstellte Wochenpläne (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
let plaene: Speiseplan[] = speiseplaene.map((p) => ({
  ...p,
  standortIds: [...p.standortIds],
  einrichtungIds: [...p.einrichtungIds],
  tage: p.tage.map((t) => ({ ...t, rezeptIds: [...t.rezeptIds] })),
}));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return plaene;
}

export function addPlan(input: { kalenderwoche: number; jahr: number; standortIds: string[]; einrichtungIds: string[] }): Speiseplan {
  const neuerPlan: Speiseplan = {
    id: `mp-${input.jahr}-${input.kalenderwoche}`,
    status: "DRAFT",
    kalenderwoche: input.kalenderwoche,
    jahr: input.jahr,
    standortIds: input.standortIds,
    einrichtungIds: input.einrichtungIds,
    tage: generateWeekTage(input.kalenderwoche, input.jahr),
  };
  plaene = [neuerPlan, ...plaene];
  emit();
  return neuerPlan;
}

export function addRezeptZuTag(planId: string, datum: string, rezeptId: string) {
  plaene = plaene.map((p) =>
    p.id !== planId
      ? p
      : {
          ...p,
          tage: p.tage.map((t) =>
            t.datum !== datum || t.rezeptIds.includes(rezeptId) ? t : { ...t, rezeptIds: [...t.rezeptIds, rezeptId] }
          ),
        }
  );
  emit();
}

export function removeRezeptVonTag(planId: string, datum: string, rezeptId: string) {
  plaene = plaene.map((p) =>
    p.id !== planId
      ? p
      : {
          ...p,
          tage: p.tage.map((t) => (t.datum !== datum ? t : { ...t, rezeptIds: t.rezeptIds.filter((id) => id !== rezeptId) })),
        }
  );
  emit();
}

export function useSpeiseplaene(): Speiseplan[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

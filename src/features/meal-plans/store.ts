import { createStore } from "@/lib/store/create-store";
import { speiseplaene } from "./data";
import { generateWeekTage } from "./utils";
import type { Speiseplan, SpeiseplanStatus } from "./types";

/**
 * Session-Store für im Admin erstellte Wochenpläne (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
const store = createStore<Speiseplan[]>(
  speiseplaene.map((p) => ({
    ...p,
    standortIds: [...p.standortIds],
    einrichtungIds: [...p.einrichtungIds],
    tage: p.tage.map((t) => ({ ...t, rezeptIds: [...t.rezeptIds] })),
  }))
);

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
  store.set((plaene) => [neuerPlan, ...plaene]);
  return neuerPlan;
}

export function addRezeptZuTag(planId: string, datum: string, rezeptId: string) {
  store.set((plaene) =>
    plaene.map((p) =>
      p.id !== planId
        ? p
        : {
            ...p,
            tage: p.tage.map((t) =>
              t.datum !== datum || t.rezeptIds.includes(rezeptId) ? t : { ...t, rezeptIds: [...t.rezeptIds, rezeptId] }
            ),
          }
    )
  );
}

export function removeRezeptVonTag(planId: string, datum: string, rezeptId: string) {
  store.set((plaene) =>
    plaene.map((p) =>
      p.id !== planId
        ? p
        : {
            ...p,
            tage: p.tage.map((t) => (t.datum !== datum ? t : { ...t, rezeptIds: t.rezeptIds.filter((id) => id !== rezeptId) })),
          }
    )
  );
}

export function updatePlanStatus(planId: string, status: SpeiseplanStatus) {
  store.set((plaene) => plaene.map((plan) => (plan.id === planId ? { ...plan, status } : plan)));
}

export function duplicatePlan(planId: string) {
  const original = store.get().find((plan) => plan.id === planId);
  if (!original) return;
  const neueWoche = original.kalenderwoche + 1;
  const neueTage = generateWeekTage(neueWoche, original.jahr).map((tag, index) => ({ ...tag, rezeptIds: [...(original.tage[index]?.rezeptIds ?? [])], hinweis: original.tage[index]?.hinweis }));
  const kopie: Speiseplan = { ...original, id: `${original.id}-copy-${Date.now()}`, status: "DRAFT", kalenderwoche: neueWoche, standortIds: [...original.standortIds], einrichtungIds: [...original.einrichtungIds], tage: neueTage };
  store.set((plaene) => [kopie, ...plaene]);
}

export function useSpeiseplaene(): Speiseplan[] {
  return store.useValue();
}

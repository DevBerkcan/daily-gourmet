import { createStore } from "@/lib/store/create-store";
import { lieferRoutenSeed } from "./data";
import { bestellungen, einrichtungById } from "@/lib/data";
import type { LieferRoute, StoppStatus } from "./types";

const routenStore = createStore<LieferRoute[]>(
  lieferRoutenSeed.map((route) => ({ ...route, stopps: route.stopps.map((stopp) => ({ ...stopp, positionen: stopp.positionen.map((position) => ({ ...position })) })) }))
);
const geladenStore = createStore<Set<string>>(new Set());
const stoppStatusStore = createStore<Map<string, StoppStatus>>(new Map());

export function addLieferRoute(input: { name: string; datum: string; fahrerId: string; start: string; einrichtungIds: string[] }) {
  const stopps = input.einrichtungIds.map((einrichtungId, index) => {
    const einrichtung = einrichtungById(einrichtungId);
    const bestellPositionen = bestellungen
      .filter((bestellung) => bestellung.einrichtungId === einrichtungId && bestellung.status !== "DRAFT" && bestellung.status !== "CANCELLED")
      .flatMap((bestellung) => bestellung.positionen)
      .filter((position) => position.datum === input.datum);
    return {
      id: `stop-${Date.now()}-${index}`,
      einrichtungId,
      reihenfolge: index + 1,
      ankunft: `${10 + index}:45`,
      zeitfenster: `${10 + index}:40–${11 + index}:00`,
      kontakt: einrichtung?.ansprechpartner ?? "—",
      telefon: einrichtung?.telefon ?? "—",
      positionen: bestellPositionen.map((position, positionsIndex) => ({
        id: `pack-${Date.now()}-${index}-${positionsIndex}`,
        rezeptId: position.rezeptId,
        portionen: position.portionen,
        behaelter: `${Math.ceil(position.portionen / 15)} × GN 1/1`,
        temperatur: "mind. 65 °C",
        hinweis: position.hinweis,
      })),
    };
  });
  const route: LieferRoute = { id: `route-${Date.now()}`, name: input.name, datum: input.datum, fahrerId: input.fahrerId, start: input.start, rueckkehr: "12:30", kilometer: 0, status: "GEPLANT", stopps };
  routenStore.set((routen) => [route, ...routen]);
}

export function updateRouteStatus(id: string, status: LieferRoute["status"]) {
  routenStore.set((routen) => routen.map((route) => (route.id === id ? { ...route, status } : route)));
}

export function toggleGeladen(positionId: string) {
  geladenStore.set((geladen) => {
    const next = new Set(geladen);
    if (next.has(positionId)) next.delete(positionId);
    else next.add(positionId);
    return next;
  });
}

export function setStoppStatus(stoppId: string, status: StoppStatus) {
  stoppStatusStore.set((stoppStatus) => new Map(stoppStatus).set(stoppId, status));
}

export function useLieferRouten(): LieferRoute[] {
  return routenStore.useValue();
}
export function useGeladenePositionen(): Set<string> {
  return geladenStore.useValue();
}
export function useStoppStatus(): Map<string, StoppStatus> {
  return stoppStatusStore.useValue();
}

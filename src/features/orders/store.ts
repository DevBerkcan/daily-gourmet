import { createStore } from "@/lib/store/create-store";
import { bestellungen as seedBestellungen } from "@/lib/data";
import type { Bestellung, BestellPosition, BestellStatus } from "@/lib/types";

/**
 * Session-Store für im Admin/Portal erstellte/bearbeitete Bestellungen (Client-only, kein Backend).
 * Seed ist ein Deep Clone der statischen Mock-Daten — Mutatoren dürfen nur aus
 * Client-Event-Handlern aufgerufen werden, nie aus Server-Code, da das Modul
 * serverseitig prozessweit resident bleibt.
 */
const store = createStore<Bestellung[]>(
  seedBestellungen.map((bestellung) => ({ ...bestellung, positionen: bestellung.positionen.map((position) => ({ ...position })) }))
);

export function saveBestellung(input: { einrichtungId: string; speiseplanId: string; positionen: BestellPosition[]; frist: string; submit: boolean }) {
  const vorhanden = store.get().find((bestellung) => bestellung.einrichtungId === input.einrichtungId && bestellung.speiseplanId === input.speiseplanId);
  const status: BestellStatus = input.submit ? "SUBMITTED" : "DRAFT";
  const zeitpunkt = input.submit ? new Date().toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : vorhanden?.abgesendetAm;
  const gespeichert: Bestellung = { id: vorhanden?.id ?? `b-${Date.now()}`, einrichtungId: input.einrichtungId, speiseplanId: input.speiseplanId, status, positionen: input.positionen, frist: input.frist, abgesendetAm: zeitpunkt };
  store.set((bestellungen) => (vorhanden ? bestellungen.map((bestellung) => (bestellung.id === vorhanden.id ? gespeichert : bestellung)) : [gespeichert, ...bestellungen]));
}

export function updateBestellStatus(id: string, status: BestellStatus) {
  store.set((bestellungen) => bestellungen.map((bestellung) => (bestellung.id === id ? { ...bestellung, status } : bestellung)));
}

export function updateBestellPositionen(id: string, positionen: BestellPosition[]) {
  store.set((bestellungen) => bestellungen.map((bestellung) => (bestellung.id === id ? { ...bestellung, positionen } : bestellung)));
}

export function useBestellungen(): Bestellung[] {
  return store.useValue();
}

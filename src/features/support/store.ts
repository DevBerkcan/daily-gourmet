import { createStore } from "@/lib/store/create-store";
import { featureFlagsSeed, supportEreignisse, supportTickets } from "./data";
import type { SupportEreignis, SupportKategorie, SupportPrioritaet, SupportSitzung, SupportStatus, SupportTicket } from "./types";

const ticketsStore = createStore<SupportTicket[]>(supportTickets);
const sitzungStore = createStore<SupportSitzung>(null);
const ereignisseStore = createStore<SupportEreignis[]>(supportEreignisse);
const featureFlagsStore = createStore<Record<string, boolean>>(featureFlagsSeed);

let supportTimeout: ReturnType<typeof setTimeout> | undefined;
const zeit = () => new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

function addEreignis(tenantId: string, akteur: string, aktion: string, detail: string) {
  ereignisseStore.set((ereignisse) => [{ id: `evt-${Date.now()}`, tenantId, zeitpunkt: `heute, ${zeit()}`, akteur, aktion, detail }, ...ereignisse]);
}

export function createSupportTicket(input: { kategorie: SupportKategorie; prioritaet: SupportPrioritaet; titel: string; nachricht: string; seite: string }) {
  const ticket: SupportTicket = { id: `SUP-${1043 + ticketsStore.get().length}`, tenantId: "t-001", tenantName: "Daily Gourmet", erstelltVon: "Miriam Hoffmann", status: "OFFEN", erstelltAm: `heute, ${zeit()}`, antworten: [], ...input };
  ticketsStore.set((tickets) => [ticket, ...tickets]);
  addEreignis("t-001", "Miriam Hoffmann", "Supportanfrage erstellt", `${ticket.id} · ${ticket.titel}`);
  return ticket;
}

export function updateSupportStatus(id: string, status: SupportStatus) {
  ticketsStore.set((tickets) => tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
  addEreignis("t-001", "Berk-Can Aydin", "Supportstatus geändert", `${id} · ${status}`);
}

export function addSupportAntwort(id: string, text: string, rolle: "SUPER_ADMIN" | "TENANT_OWNER") {
  const autor = rolle === "SUPER_ADMIN" ? "Berk-Can Aydin" : "Miriam Hoffmann";
  ticketsStore.set((tickets) =>
    tickets.map((ticket) =>
      ticket.id === id
        ? { ...ticket, status: rolle === "SUPER_ADMIN" ? "IN_BEARBEITUNG" : ticket.status, antworten: [...ticket.antworten, { id: `reply-${Date.now()}`, autor, rolle, text, zeitpunkt: `heute, ${zeit()}` }] }
        : ticket
    )
  );
  addEreignis("t-001", autor, "Supportantwort gesendet", id);
}

export function startSupportSitzung(tenantId: string, tenantName: string) {
  const jetzt = new Date();
  const ende = new Date(jetzt.getTime() + 60 * 60 * 1000);
  sitzungStore.set({ tenantId, tenantName, gestartetAm: jetzt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), endetUm: ende.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) });
  addEreignis(tenantId, "Berk-Can Aydin", "Supportzugriff gestartet", "Zeitlich begrenzter Supportmodus für 60 Minuten");
  if (supportTimeout) clearTimeout(supportTimeout);
  supportTimeout = setTimeout(() => {
    const aktuelleSitzung = sitzungStore.get();
    if (aktuelleSitzung) addEreignis(aktuelleSitzung.tenantId, "System", "Supportzugriff automatisch beendet", "Zeitlimit von 60 Minuten erreicht");
    sitzungStore.set(null);
  }, 60 * 60 * 1000);
}

export function endSupportSitzung() {
  const aktuelleSitzung = sitzungStore.get();
  if (aktuelleSitzung) addEreignis(aktuelleSitzung.tenantId, "Berk-Can Aydin", "Supportzugriff beendet", "Supportmodus manuell beendet");
  if (supportTimeout) clearTimeout(supportTimeout);
  supportTimeout = undefined;
  sitzungStore.set(null);
}

export function toggleFeatureFlag(name: string) {
  featureFlagsStore.set((featureFlags) => ({ ...featureFlags, [name]: !featureFlags[name] }));
  addEreignis("t-001", "Berk-Can Aydin", "Feature-Flag geändert", `${name}: ${featureFlagsStore.get()[name] ? "aktiv" : "inaktiv"}`);
}

export function useSupportTickets(): SupportTicket[] {
  return ticketsStore.useValue();
}
export function useSupportSitzung(): SupportSitzung {
  return sitzungStore.useValue();
}
export function useSupportEreignisse(): SupportEreignis[] {
  return ereignisseStore.useValue();
}
export function useFeatureFlags(): Record<string, boolean> {
  return featureFlagsStore.useValue();
}

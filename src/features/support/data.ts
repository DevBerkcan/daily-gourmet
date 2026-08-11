import type { SupportEreignis, SupportTicket } from "./types";

export const supportTickets: SupportTicket[] = [
  { id: "SUP-1042", tenantId: "t-001", tenantName: "Daily Gourmet", erstelltVon: "Miriam Hoffmann", kategorie: "FRAGE", prioritaet: "NORMAL", titel: "Bestellung nach Frist korrigieren", nachricht: "Wie kann ich eine bereits gesperrte Bestellung für Freitag noch einmal freigeben?", seite: "/admin/orders", status: "OFFEN", erstelltAm: "heute, 09:18", antworten: [] },
  { id: "SUP-1038", tenantId: "t-001", tenantName: "Daily Gourmet", erstelltVon: "Miriam Hoffmann", kategorie: "BUG", prioritaet: "HOCH", titel: "Produktionsplan aktualisiert sich nicht", nachricht: "Nach einer Mengenänderung wurde die Zusatzmenge erst nach erneutem Laden angezeigt.", seite: "/admin/production/pp-0806", status: "IN_BEARBEITUNG", erstelltAm: "gestern, 14:32", antworten: [{ id: "reply-1", autor: "Berk-Can Aydin", rolle: "SUPER_ADMIN", text: "Ich prüfe den Ablauf im Supportmodus und melde mich mit dem Ergebnis.", zeitpunkt: "gestern, 14:46" }] },
];

export const supportEreignisse: SupportEreignis[] = [
  { id: "evt-1", tenantId: "t-001", zeitpunkt: "heute, 09:41", akteur: "Jan Berger", aktion: "Bestellung geändert", detail: "Bestellung b-0991 nach Frist korrigiert" },
  { id: "evt-2", tenantId: "t-001", zeitpunkt: "heute, 09:18", akteur: "Miriam Hoffmann", aktion: "Supportanfrage erstellt", detail: "SUP-1042 · Bestellung nach Frist korrigieren" },
];

export const featureFlagsSeed: Record<string, boolean> = { "Kundenportal": true, "Nährwert-API (Zutaten)": true, "Einkaufslisten": true, "Bedarfsprognose (Basis)": false, "White-Label-Branding": false, "Mehrsprachigkeit": false };

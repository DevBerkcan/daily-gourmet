export type SupportKategorie = "BUG" | "FRAGE" | "FEATURE";
export type SupportPrioritaet = "NIEDRIG" | "NORMAL" | "HOCH" | "KRITISCH";
export type SupportStatus = "OFFEN" | "IN_BEARBEITUNG" | "GELOEST";

export type SupportAntwort = { id: string; autor: string; rolle: "SUPER_ADMIN" | "TENANT_OWNER"; text: string; zeitpunkt: string };
export type SupportTicket = { id: string; tenantId: string; tenantName: string; erstelltVon: string; kategorie: SupportKategorie; prioritaet: SupportPrioritaet; titel: string; nachricht: string; seite: string; status: SupportStatus; erstelltAm: string; antworten: SupportAntwort[] };
export type SupportEreignis = { id: string; tenantId: string; zeitpunkt: string; akteur: string; aktion: string; detail: string };
export type SupportSitzung = { tenantId: string; tenantName: string; gestartetAm: string; endetUm: string } | null;

export type TenantStatus = "AKTIV" | "GESPERRT" | "ARCHIVIERT";

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  ansprechpartner: string;
  email: string;
  erstelltAm: string;
  benutzerAnzahl: number;
  einrichtungenAnzahl: number;
  letzteAktivitaet: string;
}

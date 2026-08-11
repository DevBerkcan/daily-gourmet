import type { Tenant } from "./types";

export const tenants: Tenant[] = [
  { id: "t-001", name: "Daily Gourmet", status: "AKTIV", ansprechpartner: "Miriam Hoffmann", email: "m.hoffmann@dailygourmet.de", erstelltAm: "2026-01-12", benutzerAnzahl: 14, einrichtungenAnzahl: 6, letzteAktivitaet: "vor 8 Minuten" },
  { id: "t-002", name: "Küchenwerk Rhein", status: "AKTIV", ansprechpartner: "Tobias Klein", email: "klein@kuechenwerk-rhein.de", erstelltAm: "2026-03-04", benutzerAnzahl: 9, einrichtungenAnzahl: 4, letzteAktivitaet: "vor 2 Stunden" },
  { id: "t-003", name: "VitalMenü GmbH", status: "GESPERRT", ansprechpartner: "Sandra Ilg", email: "ilg@vitalmenue.de", erstelltAm: "2025-11-20", benutzerAnzahl: 5, einrichtungenAnzahl: 2, letzteAktivitaet: "vor 12 Tagen" },
  { id: "t-004", name: "Campus Catering West", status: "AKTIV", ansprechpartner: "Deniz Aydin", email: "aydin@campus-west.de", erstelltAm: "2026-05-18", benutzerAnzahl: 7, einrichtungenAnzahl: 3, letzteAktivitaet: "gestern" },
];

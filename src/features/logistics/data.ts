import type { Fahrer, LieferRoute } from "./types";

export const fahrer: Fahrer[] = [
  { id: "drv-001", name: "Markus Becker", telefon: "0176 440 28 101", fahrzeug: "Mercedes Sprinter Kühl", kennzeichen: "D-DG 201" },
  { id: "drv-002", name: "Elif Yilmaz", telefon: "0176 440 28 202", fahrzeug: "VW Crafter Thermo", kennzeichen: "D-DG 202" },
  { id: "drv-003", name: "Thomas Klein", telefon: "0176 440 28 303", fahrzeug: "Ford Transit Kühl", kennzeichen: "D-DG 203" },
];

export const lieferRoutenSeed: LieferRoute[] = [
  {
    id: "route-nord-0806", name: "Route Nord", datum: "2026-08-06", fahrerId: "drv-001", start: "10:15", rueckkehr: "12:05", kilometer: 24, status: "BELADUNG",
    stopps: [{
      id: "stop-nord-1", einrichtungId: "f-001", reihenfolge: 1, ankunft: "10:35", zeitfenster: "10:30–10:45", kontakt: "Claudia Winter", telefon: "0211 555 101", hinweis: "Anlieferung über Tor 2, Behälter vom Vortag mitnehmen.",
      positionen: [{ id: "pack-1", rezeptId: "r-001", portionen: 145, behaelter: "10 × GN 1/1", temperatur: "mind. 65 °C" }],
    }],
  },
  {
    id: "route-sued-0806", name: "Route Süd", datum: "2026-08-06", fahrerId: "drv-002", start: "10:20", rueckkehr: "12:30", kilometer: 31, status: "GEPLANT",
    stopps: [
      { id: "stop-sued-1", einrichtungId: "f-002", reihenfolge: 1, ankunft: "10:40", zeitfenster: "10:35–10:50", kontakt: "Frank Otten", telefon: "0211 555 202", hinweis: "Rampe an der Südseite nutzen.", positionen: [{ id: "pack-2", rezeptId: "r-001", portionen: 98, behaelter: "7 × GN 1/1", temperatur: "mind. 65 °C" }] },
      { id: "stop-sued-2", einrichtungId: "f-003", reihenfolge: 2, ankunft: "11:15", zeitfenster: "11:10–11:25", kontakt: "Hanna Bruns", telefon: "0211 555 303", hinweis: "Bitte an der Küchentür klingeln.", positionen: [{ id: "pack-3", rezeptId: "r-004", portionen: 60, behaelter: "4 × GN 1/1", temperatur: "mind. 65 °C", hinweis: "Allergenkennzeichnung Eier und Milch prüfen" }] },
    ],
  },
];

export const fahrerById = (id: string) => fahrer.find((eintrag) => eintrag.id === id);
export const portionenJeRoute = (route: LieferRoute) => route.stopps.reduce((summe, stopp) => summe + stopp.positionen.reduce((teil, position) => teil + position.portionen, 0), 0);
export const behaelterPositionenJeRoute = (route: LieferRoute) => route.stopps.reduce((summe, stopp) => summe + stopp.positionen.length, 0);

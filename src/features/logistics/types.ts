export type Fahrer = {
  id: string;
  name: string;
  telefon: string;
  fahrzeug: string;
  kennzeichen: string;
};

export type LieferPosition = {
  id: string;
  rezeptId: string;
  portionen: number;
  behaelter: string;
  temperatur: string;
  hinweis?: string;
};

export type RoutenStopp = {
  id: string;
  einrichtungId: string;
  reihenfolge: number;
  ankunft: string;
  zeitfenster: string;
  kontakt: string;
  telefon: string;
  hinweis?: string;
  positionen: LieferPosition[];
};

export type LieferRoute = {
  id: string;
  name: string;
  datum: string;
  fahrerId: string;
  start: string;
  rueckkehr: string;
  kilometer: number;
  status: "GEPLANT" | "BELADUNG" | "UNTERWEGS" | "ABGESCHLOSSEN";
  stopps: RoutenStopp[];
};

export type StoppStatus = "OFFEN" | "ZUGESTELLT" | "PROBLEM";

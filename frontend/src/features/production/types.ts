export type ProduktionsStatus = "PLANNED" | "PREPARING" | "COMPLETED" | "CANCELLED";

export interface ProduktionsPosition {
  rezeptId: string;
  bestellteMenge: number;
  zusatzMenge: number;
  status: ProduktionsStatus;
  begruendung?: string;
}

export interface ProduktionsPlan {
  id: string;
  datum: string;
  standortId: string;
  positionen: ProduktionsPosition[];
}

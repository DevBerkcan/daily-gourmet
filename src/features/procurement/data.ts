import type { Einkaufsliste } from "./types";

export const einkaufslisten: Einkaufsliste[] = [
  {
    id: "el-032", bezeichnung: "Bedarf KW 32 — Zentralküche", kalenderwoche: 32, standortId: "s-001", status: "REVIEWED",
    positionen: [
      { zutatId: "z-107", gesamtmengeBasis: 30.6, einkaufsmenge: 3, rezepte: ["Vollkorn Penne mit Tomaten-Kräutersauce"] },
      { zutatId: "z-016", gesamtmengeBasis: 59.2, einkaufsmenge: 10, rezepte: ["Vollkorn Penne mit Tomaten-Kräutersauce", "Gemüsecurry mit Vollkornreis"] },
      { zutatId: "z-095", gesamtmengeBasis: 33.0, einkaufsmenge: 4, rezepte: ["Hähnchennuggets mit Reis, Tomatensauce"] },
      { zutatId: "z-021", gesamtmengeBasis: 55.0, einkaufsmenge: 3, rezepte: ["Hähnchennuggets mit Reis, Tomatensauce"] },
      { zutatId: "z-075", gesamtmengeBasis: 11.5, einkaufsmenge: 3, rezepte: ["Gemüsecurry mit Vollkornreis"] },
    ],
  },
  { id: "el-031", bezeichnung: "Bedarf KW 31 — Zentralküche", kalenderwoche: 31, standortId: "s-001", status: "COMPLETED", positionen: [] },
];

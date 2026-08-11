import type { Einkaufsliste } from "./types";

export const einkaufslisten: Einkaufsliste[] = [
  {
    id: "el-032", bezeichnung: "Bedarf KW 32 — Zentralküche", kalenderwoche: 32, standortId: "s-001", status: "REVIEWED",
    positionen: [
      { zutatId: "z-006", gesamtmengeBasis: 30.6, einkaufsmenge: 3, rezepte: ["Penne al Pomodoro"] },
      { zutatId: "z-005", gesamtmengeBasis: 59.2, einkaufsmenge: 10, rezepte: ["Penne al Pomodoro", "Rote-Linsen-Curry"] },
      { zutatId: "z-002", gesamtmengeBasis: 33.0, einkaufsmenge: 4, rezepte: ["Hähnchengeschnetzeltes"] },
      { zutatId: "z-001", gesamtmengeBasis: 55.0, einkaufsmenge: 3, rezepte: ["Hähnchengeschnetzeltes"] },
      { zutatId: "z-007", gesamtmengeBasis: 11.5, einkaufsmenge: 3, rezepte: ["Rote-Linsen-Curry"] },
    ],
  },
  { id: "el-031", bezeichnung: "Bedarf KW 31 — Zentralküche", kalenderwoche: 31, standortId: "s-001", status: "COMPLETED", positionen: [] },
];

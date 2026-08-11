"use client";

import { Card, CardHeader } from "@/components/ui";
import { toggleFeatureFlag, useFeatureFlags } from "../store";

const beschreibungen: Record<string, string> = {
  "Kundenportal": "Bestellportal für Schulen und Einrichtungen",
  "Nährwert-API (Zutaten)": "Automatischer Abruf von Nährwerten über Open Food Facts / USDA",
  "Einkaufslisten": "Bedarfsaggregation und CSV-Export",
  "Bedarfsprognose (Basis)": "Neutrale Hochrechnung auf Basis bestätigter Bestellmengen — keine KI",
  "White-Label-Branding": "Eigenes Logo und Farben je Mandant",
  "Mehrsprachigkeit": "Weitere Sprachen neben Deutsch",
};

export function FeatureFlagsBoard() {
  const flags = useFeatureFlags();
  return <Card><CardHeader title="Module" hint="Jede Änderung wird im globalen Audit- und Supportverlauf protokolliert." /><ul className="divide-y divide-line">{Object.entries(flags).map(([name, aktiv]) => <li key={name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-medium text-ink">{name}</p><p className="text-sm text-muted">{beschreibungen[name]}</p><p className="mt-1 text-xs text-muted">Daily Gourmet: {aktiv ? "aktiv" : "inaktiv"}</p></div><label className="flex cursor-pointer items-center gap-3"><span className="text-xs font-medium text-muted">{aktiv ? "Aktiv" : "Inaktiv"}</span><input type="checkbox" checked={aktiv} onChange={() => toggleFeatureFlag(name)} className="peer sr-only" /><span aria-hidden className="relative inline-flex h-6 w-11 items-center rounded-full bg-line-strong transition-colors peer-checked:bg-basil peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-basil"><span className={`inline-block size-4.5 rounded-full bg-white shadow transition-transform ${aktiv ? "translate-x-5.5" : "translate-x-1"}`} /></span></label></li>)}</ul></Card>;
}

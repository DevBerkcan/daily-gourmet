"use client";

import { Card, CardHeader } from "@/components/ui";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/lib/services/super-admin";

export function FeatureFlagsBoard() {
  const flags = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  return <Card><CardHeader title="Module" hint="Jede Änderung wird im globalen Audit- und Supportverlauf protokolliert." /><ul className="divide-y divide-line">{flags.map((flag) => <li key={flag.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-medium text-ink">{flag.name}</p>{flag.description && <p className="text-sm text-muted">{flag.description}</p>}<p className="mt-1 text-xs text-muted">Standard: {flag.standardAktiv ? "aktiv" : "inaktiv"}</p></div><label className="flex cursor-pointer items-center gap-3"><span className="text-xs font-medium text-muted">{flag.standardAktiv ? "Aktiv" : "Inaktiv"}</span><input type="checkbox" checked={flag.standardAktiv} onChange={() => updateFlag.mutate({ id: flag.id, name: flag.name, description: flag.description, standardAktiv: !flag.standardAktiv })} className="peer sr-only" /><span aria-hidden className="relative inline-flex h-6 w-11 items-center rounded-full bg-line-strong transition-colors peer-checked:bg-basil peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-basil"><span className={`inline-block size-4.5 rounded-full bg-white shadow transition-transform ${flag.standardAktiv ? "translate-x-5.5" : "translate-x-1"}`} /></span></label></li>)}</ul></Card>;
}

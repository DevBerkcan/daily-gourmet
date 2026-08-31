"use client";

import { Card, CardHeader, Switch } from "@/components/ui";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/lib/services/super-admin";

export function FeatureFlagsBoard() {
  const flags = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  return (
    <Card>
      <CardHeader title="Module" hint="Jede Änderung wird im globalen Audit- und Supportverlauf protokolliert." />
      <ul className="divide-y divide-line">
        {flags.map((flag) => (
          <li key={flag.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="font-medium text-ink">{flag.name}</p>
              {flag.description && <p className="text-sm text-muted">{flag.description}</p>}
              <p className="mt-1 text-xs text-muted">Standard: {flag.standardAktiv ? "aktiv" : "inaktiv"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs font-medium text-muted">{flag.standardAktiv ? "Aktiv" : "Inaktiv"}</span>
              <Switch
                checked={flag.standardAktiv}
                label={`${flag.name} ${flag.standardAktiv ? "deaktivieren" : "aktivieren"}`}
                onChange={() => updateFlag.mutate({ id: flag.id, name: flag.name, description: flag.description, standardAktiv: !flag.standardAktiv })}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

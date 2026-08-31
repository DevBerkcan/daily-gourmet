"use client";

import { Card, CardHeader, Switch } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useFeatureFlags, useSetTenantFeatureFlag } from "@/lib/services/super-admin";

/** Per-tenant feature-flag overrides — until now the only way to set one was calling
 * PUT /super-admin/tenants/{id}/feature-flags directly (e.g. via Swagger); this is the first UI for
 * it. The global default per flag is edited separately on /super-admin/features. */
export function TenantFeatureFlagsCard({ tenantId }: { tenantId: string }) {
  const toast = useToast();
  const flags = useFeatureFlags(tenantId);
  const setFlag = useSetTenantFeatureFlag(tenantId);

  return (
    <Card>
      <CardHeader title="Feature-Flags" hint="Abweichungen vom Plattform-Standard für diesen Mandanten" />
      <ul className="divide-y divide-line">
        {flags.map((f) => {
          const effektiv = f.tenantAktiv ?? f.standardAktiv;
          return (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{f.name}</p>
                {f.description && <p className="text-xs text-muted">{f.description}</p>}
                {f.tenantAktiv === null && <p className="mt-0.5 text-[11px] text-muted">Kein Override — folgt Plattform-Standard ({f.standardAktiv ? "aktiv" : "inaktiv"})</p>}
              </div>
              <Switch
                checked={effektiv}
                label={`${f.name} ${effektiv ? "deaktivieren" : "aktivieren"}`}
                onChange={() =>
                  setFlag.mutate(
                    { featureFlagId: f.id, enabled: !effektiv },
                    { onError: () => toast.error("Änderung fehlgeschlagen. Bitte erneut versuchen.") }
                  )
                }
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

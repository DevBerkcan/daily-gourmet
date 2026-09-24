"use client";

import { LifeBuoy, ShieldAlert, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui";
import { useSupportSitzungFuerTenant, useStarteSupportSitzung, useEndeSupportSitzungAlsSuperAdmin } from "@/lib/services/support";

export function SupportAccess({ tenantId }: { tenantId: string; tenantName: string }) {
  const sitzung = useSupportSitzungFuerTenant(tenantId);
  const starteSitzung = useStarteSupportSitzung();
  const endeSitzung = useEndeSupportSitzungAlsSuperAdmin();

  return (
    <div className="px-5 py-4">
      <p className="flex items-start gap-2 text-sm text-muted">
        <ShieldAlert size={16} className={`mt-0.5 shrink-0 ${sitzung ? "text-ok" : "text-warn"}`} aria-hidden />
        {sitzung
          ? `Supportzugriff aktiv bis ${sitzung.endetUm} Uhr. Der Tenant Owner sieht den Zugriff als Banner.`
          : "Kein aktiver Supportzugriff. Ein Zugriff ist für den Mandanten sichtbar, endet automatisch nach 60 Minuten und wird im Audit-Log dokumentiert."}
      </p>
      <div className="mt-4">
        {sitzung ? (
          <Button icon={ShieldOff} label="Zugriff beenden" variant="secondary" onClick={() => endeSitzung.mutate(sitzung.id)} />
        ) : (
          <Button icon={LifeBuoy} label="Supportzugriff starten" variant="secondary" onClick={() => starteSitzung.mutate(tenantId)} />
        )}
      </div>
    </div>
  );
}

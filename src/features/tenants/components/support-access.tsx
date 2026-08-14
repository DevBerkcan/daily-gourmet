"use client";

import { Eye, LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { endSupportSitzung, startSupportSitzung, useSupportSitzung } from "@/features/support/store";

export function SupportAccess({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const router = useRouter();
  const sitzung = useSupportSitzung();
  const aktiv = sitzung?.tenantId === tenantId;
  function starten() { startSupportSitzung(tenantId, tenantName); router.push("/admin/dashboard"); }
  return <div className="px-5 py-4"><p className="flex items-start gap-2 text-sm text-muted"><ShieldAlert size={16} className={`mt-0.5 shrink-0 ${aktiv ? "text-ok" : "text-warn"}`} aria-hidden />{aktiv ? `Supportzugriff aktiv bis ${sitzung.endetUm} Uhr. Der Tenant Owner sieht den Zugriff als Banner.` : "Kein aktiver Supportzugriff. Ein Zugriff ist für den Mandanten sichtbar, endet automatisch nach 60 Minuten und wird im Audit-Log dokumentiert."}</p><div className="mt-4">{aktiv ? <Button variant="secondary" onClick={endSupportSitzung}><LogOut size={15} aria-hidden /> Zugriff beenden</Button> : <Button variant="secondary" onClick={starten}><Eye size={15} aria-hidden /> Supportzugriff starten</Button>}</div></div>;
}

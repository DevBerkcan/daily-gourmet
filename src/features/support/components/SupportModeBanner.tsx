"use client";

import { Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useAktuelleSupportSitzung, useEndeSupportSitzung } from "@/lib/services/support";

export function SupportModeBanner() {
  const sitzung = useAktuelleSupportSitzung();
  const endeSitzung = useEndeSupportSitzung();
  if (!sitzung) return null;
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-saffron bg-saffron-soft px-5 py-4 no-print"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-saffron text-white"><Eye size={19} aria-hidden /></span><div><p className="font-semibold text-ink">Super-Admin-Supportmodus aktiv</p><p className="mt-0.5 text-sm text-muted">{sitzung.gestartetVon} unterstützt {sitzung.tenantName}. Gestartet {sitzung.gestartetAm} Uhr · endet automatisch {sitzung.endetUm} Uhr · alle Aktionen werden protokolliert.</p></div></div><Button variant="secondary" onClick={() => endeSitzung.mutate()}><LogOut size={15} aria-hidden /> Supportmodus beenden</Button></div>;
}

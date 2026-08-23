"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { apiFetchBlob } from "@/lib/api/client";

/** Ersetzt die entfallene Küchen-Ansicht — ein serverseitig gerendertes PDF je Wochentag, gruppiert
 * nach Tour, im Format des Kunden-Beispiels (siehe ProductionPlanPrintHandler auf dem Backend). */
export function ProduktionsplanDruckButton({ mealPlanId, datum, wochentag }: { mealPlanId: string; datum: string; wochentag: string }) {
  const [laedt, setLaedt] = useState(false);

  const herunterladen = async () => {
    setLaedt(true);
    try {
      const blob = await apiFetchBlob(`/production-plans/print?mealPlanId=${mealPlanId}&date=${datum}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `produktionsplan-${datum}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLaedt(false);
    }
  };

  return (
    <button
      type="button"
      onClick={herunterladen}
      disabled={laedt}
      className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong py-1.5 text-xs font-medium text-muted hover:border-basil hover:text-basil no-print disabled:opacity-60"
    >
      <Printer size={13} aria-hidden /> {laedt ? "Erzeuge PDF …" : `Produktionsplan ${wochentag} drucken`}
    </button>
  );
}

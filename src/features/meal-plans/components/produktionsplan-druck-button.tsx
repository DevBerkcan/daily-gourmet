"use client";

import { useState } from "react";
import { ACTION_ICONS, Button } from "@/components/ui";
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
    <Button
      icon={ACTION_ICONS.print}
      label={`Produktionsplan ${wochentag} drucken`}
      variant="secondary"
      size="sm"
      onClick={herunterladen}
      loading={laedt}
      className="mt-1 no-print"
      showLabel
    />
  );
}

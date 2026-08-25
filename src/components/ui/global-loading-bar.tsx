"use client";

import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

/** Schmaler Ladebalken am oberen Bildschirmrand, sichtbar sobald irgendeine Abfrage oder
 * Mutation im Hintergrund läuft — deckt jede Seite ab, ohne dass jede einzelne Komponente ihren
 * eigenen Ladezustand verdrahten muss. Erscheint erst nach einer kurzen Verzögerung, damit sehr
 * schnelle Anfragen nicht bloß aufblitzen. */
export function GlobalLoadingBar() {
  const anzahlAbfragen = useIsFetching();
  const anzahlMutationen = useIsMutating();
  const [sichtbar, setSichtbar] = useState(false);

  const laedt = anzahlAbfragen + anzahlMutationen > 0;

  useEffect(() => {
    if (!laedt) { setSichtbar(false); return; }
    const timer = window.setTimeout(() => setSichtbar(true), 200);
    return () => window.clearTimeout(timer);
  }, [laedt]);

  if (!sichtbar) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent no-print" role="status" aria-label="Wird geladen">
      <div className="h-full w-1/3 animate-[global-loading-bar_1.1s_ease-in-out_infinite] bg-basil" />
      <style>{`
        @keyframes global-loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

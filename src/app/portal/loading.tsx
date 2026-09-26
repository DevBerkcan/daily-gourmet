"use client";

import { LoadingState } from "@/components/ui";

/** Sofortiges Feedback beim Wechsel zwischen Navigationspunkten: Next zeigt diese Grenze direkt
 * nach dem Klick (und prefetcht sie), während die Seite im Hintergrund nachlädt — AppShell bleibt
 * dabei stehen, weil die Datei innerhalb des Bereichs-Layouts liegt. */
export default function Loading() {
  return <LoadingState />;
}

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    // Dev- und Produktionsartefakte bleiben getrennt. So kann ein Build
    // keine Chunks eines parallel laufenden Dev-Servers überschreiben.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    // Alle Routen sind dynamisch (CSP-Nonce via headers() im Root-Layout), und Next 15 hält
    // dynamische Seiten im Client-Router-Cache standardmäßig 0 s — jeder Nav-Klick wartete daher
    // auf einen Server-Roundtrip. Die Seiten sind dünne Hüllen um Client-Komponenten (Daten kommen
    // über TanStack Query), ein kurzes Cachen der RSC-Payload ist also unbedenklich.
    experimental: { staleTimes: { dynamic: 30, static: 180 } },
    // Vorbereitet für spätere API-Anbindung (C# Backend):
    // rewrites/Proxy werden ergänzt, sobald das Backend steht.
  };
}

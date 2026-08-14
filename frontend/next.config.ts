import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    // Dev- und Produktionsartefakte bleiben getrennt. So kann ein Build
    // keine Chunks eines parallel laufenden Dev-Servers überschreiben.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    // Vorbereitet für spätere API-Anbindung (C# Backend):
    // rewrites/Proxy werden ergänzt, sobald das Backend steht.
  };
}

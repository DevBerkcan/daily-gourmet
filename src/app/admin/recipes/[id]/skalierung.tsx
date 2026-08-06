"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td } from "@/components/ui";
import { zutatById } from "@/lib/data";
import type { Rezept } from "@/lib/types";

/**
 * Interaktive Hochrechnung (Phase 1 im Client).
 * In Phase 2 rechnet das Backend mit decimal-Arithmetik —
 * das Ergebnis dieser Ansicht ist eine Vorschau.
 */
export function RezeptSkalierung({ rezept }: { rezept: Rezept }) {
  const [portionen, setPortionen] = useState(rezept.standardPortionen * 25);
  const faktor = portionen / rezept.standardPortionen;

  const rund = (n: number) => Math.round(n * 100) / 100;

  return (
    <Card>
      <CardHeader
        title="Mengen hochrechnen"
        hint={`Standardrezept: ${rezept.standardPortionen} Portionen · Faktor ${rund(faktor).toLocaleString("de-DE")}`}
        actions={
          <label className="flex items-center gap-2 text-sm no-print">
            <span className="text-muted">Zielportionen</span>
            <input
              type="number"
              min={1}
              value={portionen}
              onChange={(e) => setPortionen(Math.max(1, Number(e.target.value) || 1))}
              className="min-h-10 w-24 rounded-lg border border-line bg-surface px-3 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
              aria-label="Zielportionen"
            />
          </label>
        }
      />
      <Table head={["Zutat", "Originalmenge", "Hochgerechnet"]}>
        {rezept.zutaten.map((rz) => {
          const z = zutatById(rz.zutatId);
          return (
            <tr key={rz.zutatId}>
              <Td className="font-medium text-ink">{z?.name ?? rz.zutatId}</Td>
              <Td className="text-muted">{rz.menge.toLocaleString("de-DE")} {rz.einheit}</Td>
              <Td className="font-semibold text-basil">{rund(rz.menge * faktor).toLocaleString("de-DE")} {rz.einheit}</Td>
            </tr>
          );
        })}
      </Table>
    </Card>
  );
}

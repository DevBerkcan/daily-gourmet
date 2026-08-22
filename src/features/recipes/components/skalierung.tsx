"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td } from "@/components/ui";
import { useRezeptSkaliert } from "@/lib/services/recipes";
import type { Rezept } from "../types";

export function RezeptSkalierung({ rezept }: { rezept: Rezept }) {
  const [portionen, setPortionen] = useState(rezept.standardPortionen * 25);
  const skaliert = useRezeptSkaliert(rezept.id, portionen);

  const rund = (n: number) => Math.round(n * 100) / 100;

  return (
    <Card>
      <CardHeader
        title="Mengen hochrechnen"
        hint={`Standardrezept: ${rezept.standardPortionen} Portionen${skaliert ? ` · Faktor ${rund(skaliert.faktor).toLocaleString("de-DE")}` : ""}`}
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
        {(skaliert?.zutaten ?? rezept.zutaten.map((rz) => ({ zutatId: rz.zutatId, name: rz.zutatId, originalMenge: rz.menge, hochgerechnet: rz.menge, einheit: rz.einheit }))).map((rz) => (
          <tr key={rz.zutatId}>
            <Td className="font-medium text-ink">{rz.name}</Td>
            <Td className="text-muted">{rz.originalMenge.toLocaleString("de-DE")} {rz.einheit}</Td>
            <Td className="font-semibold text-basil">{rund(rz.hochgerechnet).toLocaleString("de-DE")} {rz.einheit}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

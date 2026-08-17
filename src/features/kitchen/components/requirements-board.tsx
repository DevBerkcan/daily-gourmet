"use client";

import { MapPin, PackageSearch } from "lucide-react";
import { Card, CardHeader, EmptyState, StatCard, Table, Td } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useProduktionsplanByDatum, useProduktionsbedarf } from "@/lib/services/production";
import { useZutaten } from "@/lib/services/ingredients";

const HEUTE = "2026-08-06";

function runde(menge: number) { return Math.round(menge * 100) / 100; }

export function RequirementsBoard() {
  const standorte = useStandorte();
  const plan = useProduktionsplanByDatum(HEUTE, standorte[0]?.id ?? "");
  const positionen = useProduktionsbedarf(plan?.id ?? "");
  const zutaten = useZutaten();

  if (!plan) {
    return (
      <Card>
        <EmptyState title="Kein Produktionsplan für heute" text="Für den heutigen Tag liegt noch kein Produktionsplan vor." />
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Zutatenpositionen" value={String(positionen.length)} hint="Für alle heutigen Gerichte" />
        <StatCard label="Lagerorte" value={String(new Set(positionen.map((p) => p.lagerort)).size)} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Zutatenbereitstellung" hint="Mengen sind bereits auf die heutige Produktionsmenge hochgerechnet." actions={<PackageSearch size={19} className="text-basil" aria-hidden />} />
        <Table head={["Zutat & Verwendung", "Lagerort", "Benötigt"]}>
          {positionen.map((position) => {
            const allergene = zutaten.find((z) => z.id === position.zutatId)?.allergene ?? [];
            return (
              <tr key={`${position.zutatId}-${position.einheit}`}>
                <Td><p className="font-semibold text-ink">{position.name}</p><p className="mt-0.5 text-xs text-muted">{position.rezepte.join(" · ")}</p>{allergene.length ? <p className="mt-1 text-xs font-medium text-warn">Allergene: {allergene.join(", ")}</p> : null}</Td>
                <Td><span className="inline-flex items-center gap-1.5 text-sm"><MapPin size={14} className="text-muted" aria-hidden />{position.lagerort ?? "—"}</span></Td>
                <Td className="font-display text-lg font-semibold text-ink">{runde(position.menge).toLocaleString("de-DE")} {position.einheit}</Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}

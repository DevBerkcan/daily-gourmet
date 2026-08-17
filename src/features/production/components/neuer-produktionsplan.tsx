"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Card, CardHeader, Button, EmptyState } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useBestellungen } from "@/lib/services/orders";
import { useProduktionsplaene, useCreateProduktionsplan } from "@/lib/services/production";

const BINDENDE_STATUS = ["SUBMITTED", "CONFIRMED", "LOCKED"];

export function NeuerProduktionsplan() {
  const router = useRouter();
  const plaene = useProduktionsplaene();
  const standorte = useStandorte();
  const einrichtungen = useEinrichtungen();
  const bestellungen = useBestellungen();
  const createPlan = useCreateProduktionsplan();
  const [standortId, setStandortId] = useState(standorte[0]?.id ?? "");
  const [datumOverride, setDatumOverride] = useState<string | undefined>(undefined);

  const bestelldatenJeStandort = useMemo(() => {
    const facilityIdsAtLocation = new Set(einrichtungen.filter((e) => e.standortId === standortId).map((e) => e.id));
    const dates = new Set<string>();
    bestellungen
      .filter((b) => BINDENDE_STATUS.includes(b.status) && facilityIdsAtLocation.has(b.einrichtungId))
      .forEach((b) => b.positionen.forEach((p) => dates.add(p.datum)));
    return [...dates].sort();
  }, [bestellungen, einrichtungen, standortId]);

  const verfuegbareDaten = useMemo(() => {
    const verplant = new Set(plaene.filter((p) => p.standortId === standortId).map((p) => p.datum));
    return bestelldatenJeStandort.filter((d) => !verplant.has(d));
  }, [plaene, standortId, bestelldatenJeStandort]);

  const datum = datumOverride && verfuegbareDaten.includes(datumOverride) ? datumOverride : (verfuegbareDaten[0] ?? "");
  const kannAnlegen = datum !== "";

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/production" className="hover:text-basil hover:underline">Produktion</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Produktionsplan erstellen</span>
      </nav>

      <PageHeader title="Produktionsplan erstellen" subtitle="Die Bestellmenge je Gericht wird automatisch aus den bestätigten Bestellungen für Standort und Tag berechnet." />

      <Card>
        <CardHeader title="Standort & Liefertag" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Standort</span>
            <select
              value={standortId}
              onChange={(e) => { setStandortId(e.target.value); setDatumOverride(undefined); }}
              className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
            >
              {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          {verfuegbareDaten.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState title="Keine offenen Bestellungen ohne Produktionsplan" text="Für diesen Standort gibt es aktuell keinen Liefertag mit bestätigten Bestellungen, der noch keinen Produktionsplan hat." />
            </div>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Liefertag</span>
              <select value={datum} onChange={(e) => setDatumOverride(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
                {verfuegbareDaten.map((d) => (
                  <option key={d} value={d}>{new Date(d).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </Card>

      <div className="mt-6 flex justify-end gap-2 no-print">
        <Button variant="secondary" href="/admin/production">Abbrechen</Button>
        <Button
          disabled={!kannAnlegen}
          onClick={() => {
            createPlan.mutate({ datum, standortId }, { onSuccess: (plan) => router.push(`/admin/production/${plan.id}`) });
          }}
        >
          Produktionsplan anlegen
        </Button>
      </div>
    </>
  );
}

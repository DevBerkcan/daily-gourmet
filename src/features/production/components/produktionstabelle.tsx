"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Table, Td, StatusBadge, Pagination } from "@/components/ui";
import { useProduktionsplaene } from "@/lib/services/production";
import { useSpeiseplaene } from "@/lib/services/meal-plans";
import { useStandorte } from "@/lib/services/locations";
import { usePagination } from "@/lib/use-pagination";
import { isoWeekInfo, weekdayDatesOfIsoWeek } from "@/lib/isoWeek";
import { ProduktionsplanDruckButton } from "@/features/meal-plans/components/produktionsplan-druck-button";

export function Produktionstabelle() {
  const speiseplaene = useSpeiseplaene();
  const standorte = useStandorte();
  const [kwFilter, setKwFilter] = useState("");
  const [standortFilter, setStandortFilter] = useState("");

  const kwOptionen = useMemo(
    () => [...speiseplaene].sort((a, b) => b.jahr - a.jahr || b.kalenderwoche - a.kalenderwoche),
    [speiseplaene]
  );

  const zeitraum = useMemo(() => {
    if (!kwFilter) return undefined;
    const [jahr, kalenderwoche] = kwFilter.split("-").map(Number);
    const tage = weekdayDatesOfIsoWeek(kalenderwoche, jahr);
    return { von: tage[0], bis: tage[4] };
  }, [kwFilter]);

  const plaene = useProduktionsplaene({ von: zeitraum?.von, bis: zeitraum?.bis, standortId: standortFilter || undefined });
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(plaene);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 no-print">
          <select aria-label="Nach Kalenderwoche filtern" value={kwFilter} onChange={(e) => setKwFilter(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="">Alle Kalenderwochen</option>
            {kwOptionen.map((p) => (
              <option key={p.id} value={`${p.jahr}-${p.kalenderwoche}`}>KW {p.kalenderwoche} / {p.jahr}</option>
            ))}
          </select>
          <select aria-label="Nach Standort filtern" value={standortFilter} onChange={(e) => setStandortFilter(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="">Alle Standorte</option>
            {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </Card>
      {pageItems.map((pp) => {
        const gesamt = pp.positionen.reduce((s, p) => s + p.bestellteMenge + p.zusatzMenge, 0);
        const { week, year } = isoWeekInfo(new Date(`${pp.datum}T00:00:00Z`));
        const speiseplan = speiseplaene.find((sp) => sp.kalenderwoche === week && sp.jahr === year);
        const wochentag = new Date(`${pp.datum}T00:00:00Z`).toLocaleDateString("de-DE", { weekday: "long" });
        return (
          <Card key={pp.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <Link href={`/admin/production/${pp.id}`} className="text-sm font-semibold text-basil hover:underline">
                  {new Date(`${pp.datum}T00:00:00Z`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
                </Link>
                <p className="text-xs text-muted">{pp.standortName}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted">Gesamt: <span className="font-display text-lg font-semibold text-ink">{gesamt}</span> Portionen</p>
                {speiseplan && speiseplan.status !== "DRAFT" && (
                  <ProduktionsplanDruckButton mealPlanId={speiseplan.id} datum={pp.datum} wochentag={wochentag} />
                )}
              </div>
            </div>
            <Table head={["Gericht", "Bestellt", "Zusatzmenge", "Produktion", "Status"]}>
              {pp.positionen.map((pos) => (
                <tr key={pos.id} className="hover:bg-paper">
                  <Td className="font-medium text-ink">{pos.rezeptName}</Td>
                  <Td>{pos.bestellteMenge}</Td>
                  <Td>
                    {pos.zusatzMenge > 0 ? (
                      <span>
                        <span className="font-medium text-warn">+{pos.zusatzMenge}</span>
                        {pos.begruendung && <span className="block text-xs text-muted">{pos.begruendung}</span>}
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </Td>
                  <Td className="font-semibold text-basil">{pos.bestellteMenge + pos.zusatzMenge}</Td>
                  <Td><StatusBadge status={pos.status} /></Td>
                </tr>
              ))}
            </Table>
          </Card>
        );
      })}
      <Card>
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
    </div>
  );
}

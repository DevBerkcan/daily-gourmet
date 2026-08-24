"use client";

import Link from "next/link";
import { Card, Table, Td, StatusBadge, Pagination } from "@/components/ui";
import { useProduktionsplaene } from "@/lib/services/production";
import { usePagination } from "@/lib/use-pagination";

export function Produktionstabelle() {
  const plaene = useProduktionsplaene();
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(plaene);

  return (
    <div className="flex flex-col gap-6">
      {pageItems.map((pp) => {
        const gesamt = pp.positionen.reduce((s, p) => s + p.bestellteMenge + p.zusatzMenge, 0);
        return (
          <Card key={pp.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <Link href={`/admin/production/${pp.id}`} className="text-sm font-semibold text-basil hover:underline">
                  {new Date(pp.datum).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
                </Link>
                <p className="text-xs text-muted">{pp.standortName}</p>
              </div>
              <p className="text-sm text-muted">Gesamt: <span className="font-display text-lg font-semibold text-ink">{gesamt}</span> Portionen</p>
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

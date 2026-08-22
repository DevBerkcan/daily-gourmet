"use client";

import Link from "next/link";
import { Card, Table, Td, StatusBadge } from "@/components/ui";
import { useProduktionsplaene } from "@/lib/services/production";

export function Produktionstabelle() {
  const plaene = useProduktionsplaene();

  return (
    <div className="flex flex-col gap-6">
      {plaene.map((pp) => {
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
    </div>
  );
}

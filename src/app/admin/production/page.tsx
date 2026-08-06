import Link from "next/link";
import { PageHeader, Card, Table, Td, StatusBadge, DummyNote } from "@/components/ui";
import { produktionsplaene, rezeptById, standortById } from "@/lib/data";

export const metadata = { title: "Produktionsplanung" };

export default function ProductionPage() {
  return (
    <>
      <PageHeader
        title="Produktionsplanung"
        subtitle="Aggregierte, bestätigte Bestellmengen je Tag und Standort. Bestellte Menge + dokumentierte Zusatzmenge = finale Produktionsmenge."
      />
      <div className="flex flex-col gap-6">
        {produktionsplaene.map((pp) => {
          const gesamt = pp.positionen.reduce((s, p) => s + p.bestellteMenge + p.zusatzMenge, 0);
          return (
            <Card key={pp.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <div>
                  <Link href={`/admin/production/${pp.datum}`} className="text-sm font-semibold text-basil hover:underline">
                    {new Date(pp.datum).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
                  </Link>
                  <p className="text-xs text-muted">{standortById(pp.standortId)?.name}</p>
                </div>
                <p className="text-sm text-muted">Gesamt: <span className="font-display text-lg font-semibold text-ink">{gesamt}</span> Portionen</p>
              </div>
              <Table head={["Gericht", "Bestellt", "Zusatzmenge", "Produktion", "Status"]}>
                {pp.positionen.map((pos) => (
                  <tr key={pos.rezeptId} className="hover:bg-paper">
                    <Td className="font-medium text-ink">{rezeptById(pos.rezeptId)?.name}</Td>
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
      <DummyNote />
    </>
  );
}

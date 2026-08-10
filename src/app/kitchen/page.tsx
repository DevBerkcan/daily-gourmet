import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { produktionsplaene, rezeptById, standortById } from "@/lib/data";
import { Printer } from "lucide-react";

export const metadata = { title: "Küche — Heutige Produktion" };

export default function KitchenDashboard() {
  const heute = produktionsplaene[0];
  const gesamt = heute.positionen.reduce((s, p) => s + p.bestellteMenge + p.zusatzMenge, 0);

  return (
    <>
      <PageHeader
        title="Heutige Produktion"
        subtitle={`Donnerstag, 06. August · ${standortById(heute.standortId)?.name}`}
        actions={<Button variant="secondary"><Printer size={15} aria-hidden /> Küchenzettel drucken</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Gesamtportionen heute" value={String(gesamt)} />
        <StatCard label="Gerichte" value={String(heute.positionen.length)} />
        <StatCard label="In Zubereitung" value="1" tone="warn" hint="Penne al Pomodoro" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Produktionsaufgaben" hint="Status je Gericht aktualisieren — Änderungen sind für die Verwaltung sichtbar" />
        <Table head={["Gericht", "Portionen", "Status", "Rezept", "Status ändern"]}>
          {heute.positionen.map((pos) => {
            const r = rezeptById(pos.rezeptId);
            return (
              <tr key={pos.rezeptId} className="hover:bg-paper">
                <Td className="font-medium text-ink">{r?.name}</Td>
                <Td className="font-semibold">{pos.bestellteMenge + pos.zusatzMenge}</Td>
                <Td><StatusBadge status={pos.status} /></Td>
                <Td>
                  <Link href={`/admin/recipes/${pos.rezeptId}`} className="text-xs font-medium text-basil hover:underline">
                    Zubereitungsschritte öffnen
                  </Link>
                </Td>
                <Td>
                  <div className="flex gap-2 no-print">
                    {pos.status === "PLANNED" && <Button variant="secondary">Zubereitung starten</Button>}
                    {pos.status === "PREPARING" && <Button>Abschließen</Button>}
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <DummyNote />
    </>
  );
}

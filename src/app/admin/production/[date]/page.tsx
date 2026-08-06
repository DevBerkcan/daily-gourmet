import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { produktionsplaene, rezeptById, zutatById, standortById } from "@/lib/data";
import { Printer, Download } from "lucide-react";

export default async function ProductionDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const pp = produktionsplaene.find((p) => p.datum === date);
  if (!pp) notFound();

  const datumLabel = new Date(pp.datum).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/production" className="hover:text-basil hover:underline">Produktion</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{datumLabel}</span>
      </nav>

      <PageHeader
        title={`Produktion ${datumLabel}`}
        subtitle={standortById(pp.standortId)?.name}
        actions={
          <>
            <Button variant="secondary"><Download size={15} aria-hidden /> Export</Button>
            <Button variant="secondary"><Printer size={15} aria-hidden /> Druckansicht</Button>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {pp.positionen.map((pos) => {
          const rezept = rezeptById(pos.rezeptId);
          if (!rezept) return null;
          const finaleMenge = pos.bestellteMenge + pos.zusatzMenge;
          const faktor = finaleMenge / rezept.standardPortionen;
          const rund = (n: number) => Math.round(n * 100) / 100;

          return (
            <Card key={pos.rezeptId}>
              <CardHeader
                title={rezept.name}
                hint={`Bestellt: ${pos.bestellteMenge} · Zusatz: +${pos.zusatzMenge} · Produktion: ${finaleMenge} Portionen (Faktor ${rund(faktor).toLocaleString("de-DE")})`}
                actions={<StatusBadge status={pos.status} />}
              />
              <Table head={["Zutat", "Rezeptmenge (Basis)", "Hochgerechnet für Produktion"]}>
                {rezept.zutaten.map((rz) => (
                  <tr key={rz.zutatId}>
                    <Td className="font-medium text-ink">{zutatById(rz.zutatId)?.name}</Td>
                    <Td className="text-muted">{rz.menge.toLocaleString("de-DE")} {rz.einheit} / {rezept.standardPortionen} Port.</Td>
                    <Td className="font-semibold text-basil">{rund(rz.menge * faktor).toLocaleString("de-DE")} {rz.einheit}</Td>
                  </tr>
                ))}
              </Table>
              {pos.begruendung && (
                <p className="border-t border-line px-5 py-3 text-xs text-muted">
                  Zusatzmenge begründet: {pos.begruendung} — protokolliert im Audit-Log.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <DummyNote />
    </>
  );
}

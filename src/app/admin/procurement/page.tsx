import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { einkaufslisten, zutatById, standortById } from "@/lib/data";
import { Printer, Download } from "lucide-react";

export const metadata = { title: "Einkauf" };

export default function ProcurementPage() {
  const aktuelle = einkaufslisten[0];
  return (
    <>
      <PageHeader
        title="Einkaufs- und Bedarfslisten"
        subtitle="Aggregierter Zutatenbedarf aus den Produktionsplänen — identische Zutaten werden zusammengefasst und in Einkaufseinheiten umgerechnet."
        actions={
          <>
            <Button variant="secondary"><Download size={15} aria-hidden /> CSV-Export</Button>
            <Button variant="secondary"><Printer size={15} aria-hidden /> Druckansicht</Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title={aktuelle.bezeichnung}
          hint={`${standortById(aktuelle.standortId)?.name} · Kalenderwoche ${aktuelle.kalenderwoche}`}
          actions={<StatusBadge status={aktuelle.status} />}
        />
        <Table head={["Zutat", "Gesamtbedarf (Basis)", "Einkaufseinheit", "Bestellmenge", "Aus Rezepten", "Lieferant"]}>
          {aktuelle.positionen.map((pos) => {
            const z = zutatById(pos.zutatId);
            if (!z) return null;
            return (
              <tr key={pos.zutatId} className="hover:bg-paper">
                <Td>
                  <span className="font-medium text-ink">{z.name}</span>
                  <span className="block text-xs text-muted">{z.artikelnummer}</span>
                </Td>
                <Td>{pos.gesamtmengeBasis.toLocaleString("de-DE")} {z.basiseinheit}</Td>
                <Td className="text-muted">{z.einkaufseinheit}</Td>
                <Td className="font-semibold text-basil">{pos.einkaufsmenge} ×</Td>
                <Td className="max-w-56 text-xs text-muted">{pos.rezepte.join(", ")}</Td>
                <Td className="text-muted">{z.lieferant}</Td>
              </tr>
            );
          })}
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 no-print">
          <p className="text-xs text-muted">Nachvollziehbar: Jede Position zeigt Gesamtmenge, Basiseinheit, Einkaufseinheit und zugrunde liegende Rezepte.</p>
          <Button variant="secondary">Als geprüft markieren</Button>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Frühere Listen" />
        <Table head={["Bezeichnung", "KW", "Standort", "Status"]}>
          {einkaufslisten.slice(1).map((l) => (
            <tr key={l.id} className="hover:bg-paper">
              <Td className="font-medium text-ink">{l.bezeichnung}</Td>
              <Td>{l.kalenderwoche}</Td>
              <Td className="text-muted">{standortById(l.standortId)?.name}</Td>
              <Td><StatusBadge status={l.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>

      <DummyNote />
    </>
  );
}

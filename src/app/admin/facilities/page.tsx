import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, Tag, DummyNote } from "@/components/ui";
import { einrichtungen, standorte, standortById } from "@/lib/data";
import { Plus } from "lucide-react";

export const metadata = { title: "Einrichtungen" };

export default function FacilitiesPage() {
  return (
    <>
      <PageHeader
        title="Einrichtungen"
        subtitle="Schulen, Kitas und weitere Abnehmer, die über das Kundenportal bestellen."
        actions={<Button><Plus size={16} aria-hidden /> Einrichtung anlegen</Button>}
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Einrichtung suchen …" />
          <select aria-label="Nach Standort filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Standorte</option>
            {standorte.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Table head={["Einrichtung", "Kundennr.", "Ansprechpartner", "Standort", "Bestellfrist", "Liefertage", "Preis/Portion", "Status"]}>
          {einrichtungen.map((e) => (
            <tr key={e.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{e.name}</span>
                <span className="block text-xs text-muted">{e.anschrift}</span>
              </Td>
              <Td className="text-muted">{e.kundennummer}</Td>
              <Td>
                <span>{e.ansprechpartner}</span>
                <span className="block text-xs text-muted">{e.email}</span>
              </Td>
              <Td className="text-muted">{standortById(e.standortId)?.name}</Td>
              <Td className="text-muted">{e.bestellfrist}</Td>
              <Td><span className="flex gap-1">{e.aktiveWochentage.map((t) => <Tag key={t}>{t}</Tag>)}</span></Td>
              <Td>{e.portionspreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td>
              <Td><StatusBadge status={e.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}
